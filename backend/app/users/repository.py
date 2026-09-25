from sqlalchemy.orm import Session
from app.users.models import User


def get_user_by_id(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)