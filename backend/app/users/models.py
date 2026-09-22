from database.base import Base
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column


# Класс базы данных пользователя
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    email: Mapped[str] = mapped_column(
            String(255),
            unique=True,
            nullable=False,
            index=True
            )  
         
    '''phone: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True
        )'''
    
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
        ) 
    
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
        ) 
    
    middle_name: Mapped[str] = mapped_column(String(50))
    second_name: Mapped[str] = mapped_column(String(50),
                                             nullable=False)
    
    '''birth_date: Mapped[str] = mapped_column(unique=True)
    gender: Mapped[str]
    
    is_verified_email: Mapped[bool]
    is_verified_phone: Mapped[bool]
    is_supervise: Mapped[bool]'''
    
    created_at: Mapped[str] = mapped_column(DateTime, 
                                            nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime, 
                                            nullable=False)
    last_login_at: Mapped[str] = mapped_column(DateTime, 
                                               nullable=False)
    '''status: Mapped[str]'''
    
    
    '''avatar_url: Mapped[str]
    language: Mapped[str]
    timezone: Mapped[str]
    
    referral_code: Mapped[str]
    referral_id: Mapped[int]
    
    accepted_terms_at: Mapped[str]
    accepted_privacy_policy_at: Mapped[str]
    allow_push_notifications: Mapped[str]
    allow_marketing_emails: Mapped[str]'''