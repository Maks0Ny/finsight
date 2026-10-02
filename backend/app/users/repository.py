from sqlalchemy.orm import Session
from sqlalchemy import select
from .models import User


def get_user_by_id(
    session: Session, 
    user_id: int
) -> User | None:
    return session.get(User, user_id)


def get_user_by_email(
    session: Session,
    email: str 
) -> User | None:
    return session.scalar(select(User).where(User.email == email))


def save_user(
    session: Session, 
    user: User
) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


