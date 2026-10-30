from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, DateTime, Identity, ForeignKey, String, func
from datetime import datetime 

from ..database.base import Base



class AuthSession(Base):
    __tablename__ = "auth_session"
    
    id: Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    
    token_hash: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable = False
    )
    
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False
    )
    
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )