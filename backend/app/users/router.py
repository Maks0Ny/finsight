from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.session import get_session
from .models import User
from .schemas import UserResponse, UserCreateRequest
from .service import get_user, register_user

from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/read_me", response_model=UserResponse, status_code=200)
def read_me(
    user: User = Depends(get_current_user)
) -> User:
    return user

@router.get("/{user_id}", response_model=UserResponse, status_code=200)
def read_user(
    user_id: int, 
    db: Session = Depends(get_session)
) -> User:
    return get_user(db, user_id)

@router.post("/create", response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_session)
) -> User:
    return register_user(db, data)


