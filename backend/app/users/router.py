from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_session
from .models import User
from .schemas import UserResponse, UserCreateRequest
from .service import get_user, register_user


router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=UserResponse, status_code=200)
def read_user(
    user_id: int, 
    db: Session = Depends(get_session)
) -> User:
    
    return get_user(db, user_id)

@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_session)
) -> User:
    return register_user(db, data)