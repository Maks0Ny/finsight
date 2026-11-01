from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..database.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    __table_args__ = (
        CheckConstraint(
            "status IN ('uploaded', 'validating', 'importing', "
            "'ready', 'invalid', 'failed')",
            name="ck_datasets_status",
        ),
        CheckConstraint(
            "file_size_bytes >= 0",
            name="ck_datasets_file_size",
        ),
        Index(
            "ix_datasets_organization_created",
            "organization_id",
            "created_at",
        ),
    )

    # Кому принадлежит датасет
    id: Mapped[int] = mapped_column(
        BigInteger, Identity(), primary_key=True
    )
    organization_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("organizations.id"), nullable=False
    )
    uploaded_by_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    # Исходный файл
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    original_filename: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    storage_key: Mapped[str] = mapped_column(
        Text, unique=True, nullable=False
    )
    file_sha256: Mapped[str] = mapped_column(
        String(64), nullable=False
    )
    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger, nullable=False
    )

    # Формат и правила импорта
    source_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    ) 
    format: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  
    adapter_name: Mapped[str | None] = mapped_column(String(80))
    adapter_version: Mapped[str | None] = mapped_column(String(40))


    # Состояние импорта
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="uploaded"
    )
    attempt_number: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )

    # Счётчики строк
    total_rows: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )
    valid_rows: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )
    invalid_rows: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )
    imported_rows: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )
    raw_rows_saved: Mapped[int] = mapped_column(
        BigInteger, nullable=False, server_default="0"
    )

    # Итоговая ошибка, если импорт не удался
    error_code: Mapped[str | None] = mapped_column(String(100))
    error_message: Mapped[str | None] = mapped_column(Text)

    # Время
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )