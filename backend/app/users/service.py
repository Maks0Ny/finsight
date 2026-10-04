from sqlalchemy.orm import Session
from .models import User
from .errors import UserNotFoundError, UserAlreadyExistsError
from .repository import get_user_by_id, get_user_by_email, save_user
from .schemas import UserCreateRequest
from datetime import datetime, timezone
from ..auth.security import hash_password
def get_user(
    session: Session, 
    user_id: int
) -> User:
    user = get_user_by_id(session, user_id)
    
    if user is None:
        raise UserNotFoundError
    
    return user


def register_user(
    session: Session, 
    data: UserCreateRequest
) -> User:
    if get_user_by_email(session, data.email) is not None:
        raise UserAlreadyExistsError()
    
    password_hash = hash_password(data.password)
    now = datetime.now(timezone.utc)
    
    user = User(
        email=data.email,
        password_hash=password_hash,
        name=data.name,
        second_name=data.second_name,
        middle_name=data.middle_name,
        
        created_at=now,
        updated_at=now,
        last_login_at=None
    )
    
    return save_user(session, user) 
    