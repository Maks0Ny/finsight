from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from ..core.config import settings
from .schemas import LoginRequest, TokenResponse
from .errors import InvalidCredentialsError, InvalidRefreshTokenError
from .security import verify_password, create_access_token, create_refresh_token, hash_refresh_token

from ..users.repository import get_user_by_email, get_user_by_id
from .repository import add_auth_session, consume_auth_session


def create_token_pair(
    session: Session,
    user_id: int,
    now: datetime,
) -> TokenResponse:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token()
    
    add_auth_session(
        session=session,
        user_id=user_id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=now + timedelta(days=settings.refresh_token_days)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )

def refresh_tokens(
    session: Session,
    old_refresh_token: str,
) -> TokenResponse:
    
    now_time = datetime.now(timezone.utc)
    
    token_hash = hash_refresh_token(old_refresh_token)
    user_id = consume_auth_session(session, token_hash, now_time)
    
    if user_id is None:
        raise InvalidRefreshTokenError
    
    user = get_user_by_id(session, user_id)
    if user is None:
        raise InvalidRefreshTokenError()

    tokens = create_token_pair(session, user.id, now_time)
    session.commit()

    return tokens


def login_user(
    session: Session,
    data: LoginRequest
) -> TokenResponse:
    
    user = get_user_by_email(session, data.email)
    
    if user is None or not verify_password(data.password, user.password_hash):
        raise InvalidCredentialsError()
    
    now = datetime.now(timezone.utc)
    user.last_login_at = now
    
    tokens = create_token_pair(session, user.id, now)
    session.commit()

    return tokens


def logout_user(
    session: Session,
    refresh_token: str,
) -> None:
    
    now = datetime.now(timezone.utc)
    token_hash = hash_refresh_token(refresh_token)
    
    user_id = consume_auth_session(session, token_hash, now)
    
    if user_id is None:
        raise InvalidRefreshTokenError
    
    session.commit()