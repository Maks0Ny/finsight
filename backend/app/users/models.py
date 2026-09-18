from database.base import Base
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)  # Первичный ключ
    name: Mapped[str] = mapped_column(String(50)) # Строковое поле
    middle_name: Mapped[str] = mapped_column(String(50))
    second_name: Mapped[str] = mapped_column(String(50))
    birth_date: Mapped[str] = mapped_column(unique=True)
    gender: Mapped[str]
    
    email: Mapped[str] = mapped_column(unique=True)# Уникальное поле
    phone: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str] = mapped_column(unique=True)
    
    is_verified_email: Mapped[bool]
    is_verified_phone: Mapped[bool]
    is_supervise: Mapped[bool]
    
    created_at: Mapped[str]
    updated_at: Mapped[str]
    last_login_at: Mapped[str]
    status: Mapped[str]
    
    avatar_url: Mapped[str]
    language: Mapped[str]
    timezone: Mapped[str]
    
    referral_code: Mapped[str]
    referral_id: Mapped[int]
    
    accepted_terms_at: Mapped[str]
    accepted_privacy_policy_at: Mapped[str]
    allow_push_notifications: Mapped[str]
    allow_marketing_emails: Mapped[str]