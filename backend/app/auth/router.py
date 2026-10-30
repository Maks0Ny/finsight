from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database.session import get_session

from .schemas import LoginRequest, TokenResponse, RefreshRequest
from .service import login_user, refresh_tokens, logout_user

router = APIRouter(prefix="/auth", tags=["Auth"])

# Функция для регистрации пользователя
@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_session),
) -> TokenResponse:
    return login_user(db, data)


@router.post("/refresh")
def refresh(
    data: RefreshRequest,
    db: Session = Depends(get_session),
) -> TokenResponse:
    return refresh_tokens(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: RefreshRequest,
    db: Session = Depends(get_session)
) -> None:
    logout_user(db, data.refresh_token)