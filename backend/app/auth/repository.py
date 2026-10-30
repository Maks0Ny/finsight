from datetime import datetime

from sqlalchemy import update
from sqlalchemy.orm import Session
from ..database.session import get_session

from .models import AuthSession



def add_auth_session(
    session: Session,
    user_id: int,
    token_hash: str,
    expires_at: datetime
) -> None:
    auth_session = AuthSession(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    
    session.add(auth_session)
    
    
    
def consume_auth_session(
    session: Session,
    token_hash: str,
    now: datetime
) -> int | None:
    statement = (
        update(AuthSession)
        .where(
            AuthSession.token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
        .values(revoked_at=now)
        .returning(AuthSession.user_id)
    )
    
    return session.scalar(statement)