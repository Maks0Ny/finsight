from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_session
from models import User
from schemas import UserResponse
from service import get_user


router = APIRouter(prefix="/users", tags=["Users"])

@router.get("{user_id}", response_model=UserResponse)
def read_user(
    user_id: int, 
    db: Session = Depends(get_session)
             ) -> User:
    
    return get_user(db, user_id)

@router.post("")