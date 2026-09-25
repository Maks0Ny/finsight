from sqlalchemy.orm import Session
from models import User
from errors import UserNotFoundError
from repository import get_user_by_id


def get_user(session: Session, user_id: int) -> User:
    user = get_user_by_id(session, user_id)
    
    if user is None:
        raise UserNotFoundError
    
    return user