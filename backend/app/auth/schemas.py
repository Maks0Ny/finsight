from typing import Literal
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer" # Не принимаем ничего кроме bearer и подставляем bearer в любом случае
    # Bearer - это способ передачи токена в HTTP-заголовке