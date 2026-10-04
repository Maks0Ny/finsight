from datetime import datetime, timedelta, timezone

import hashlib
import secrets
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from ..core.config import settings
from .errors import InvalidAccessTokenError

password_hasher = PasswordHash.recommended() # Создаём пароль с рекомендуемым алгоритмом хеширования (тут Argon2)
ALGORITHM = "HS256"

# Функция для хещированяи пароля 
def hash_password(password: str) -> str:
    return password_hasher.hash(password)

# Функция для проверки пароля при входе
def verify_password(password: str, storage_hash: str) -> bool:
    return password_hasher.verify(password, storage_hash)


# Создание короткого JWT для запроса к API
def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    
    return jwt.encode(
        {
            "sub": str(user_id), # Кому выдан
            "type": "access", # Вид токена
            "iat": now, # issued at (когда создан)
            "exp": now + timedelta(minutes=settings.access_token_minutes) # Время действия
        },
        settings.auth_secret_key,
        algorithm=ALGORITHM
    )    
    
    
# Проверить JWT и вернуть ID пользователя
def get_user_id_from_access_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.auth_secret_key,
            algorithms=[ALGORITHM],
            options={"require": ["sub", "exp", "type"]},
        )
        
        if payload["type"] != "access":
            raise ValueError("Wrong token type")
        
        user_id = int(payload["sub"])
        
        if user_id <= 0:
            raise ValueError("Invalid user ID")
        
        return user_id
    
    except (InvalidTokenError, ValueError, TypeError) as exc:
        raise InvalidAccessTokenError() from exc
    
    

# Случайный токен для долгой сессии
def create_refresh_token() -> str:
    return secrets.token_urlsafe(32)


# Сохранение в БД хеша, а не исходного refresh token
def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()