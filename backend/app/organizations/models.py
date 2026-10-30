from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    String,
    UniqueConstraint,
    func,
    Text
)
from datetime import datetime
from backend.app.users.models import User

class Organization(Base):
    __tablename__ = "organizations"
    
    id: Mapped[int] = mapped_column(
        Identity(), 
        primary_key=True
    )
    
    name: Mapped[str] = mapped_column(
        String(200),
        nullable = False
    )
    
    slug: Mapped[str] = mapped_column(
        String(100),
        nullable = False,
        unique=True
    ) # короткий адрес
    
    base_currency: Mapped[str] = mapped_column(
        String(3),
        nullable = False
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable = False
    )
    
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable = False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False
    )
    
    timezone: Mapped[str] = mapped_column(
        String(64),
        nullable = False
    )
    
    language: Mapped[str] = mapped_column(
        String(16),
        nullable = False
    )
    
    legal_name: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True
    ) # юридическое название
    
    registration_country: Mapped[str | None] = mapped_column(
        String(2),
        nullable=True
    )
    
    tax_identifier: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True
        ) # налоговый идентификатор
    
    description: Mapped[str | None] = mapped_column(
        Text, 
        nullable=True
    )
    
    logo_storage_key: Mapped[str | None] = mapped_column(
        Text, 
        nullable=True
    ) # ключ файла логотипа
    
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
        
    suspended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True)) # дата остановки
    
    status_reason_code: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True
    ) # причина ограничения
    
    



class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"
    
    __table_args__ = (
        # Один пользователь не может дважды состоять в одной организации.
        UniqueConstraint(
            "organization_id",
            "user_id",
            name="uq_membership_organization_user",
        ),
        CheckConstraint(
            "role IN ('owner', 'analyst', 'viewer')",
            name="ck_membership_role",
        ),
        Index("ix_memberships_user_id", "user_id"),
    )

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(String(20), nullable=False)

    status: Mapped[str] = mapped_column(String(20), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Удобный доступ к связанным Python-объектам.
    organization: Mapped["Organization"] = relationship()
    user: Mapped[User] = relationship()