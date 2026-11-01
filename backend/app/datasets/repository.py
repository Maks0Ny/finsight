from sqlalchemy.orm import Session
from sqlalchemy import select

from ..organizations.models import OrganizationMembership
from .models import Dataset


def save_dataset(
    session: Session, 
    dataset: Dataset
) -> Dataset:
    session.add(dataset)
    return dataset


def get_datasets_by_organization_id(
    session: Session,
    organization_id: int,
) -> list[Dataset]:
    statement = (
        select(Dataset)
        .where(Dataset.organization_id == organization_id)
        .order_by(Dataset.created_at.desc(), Dataset.id.desc())
    )
    return list(session.scalars(statement))


def get_dataset_by_dataset_id(
    session: Session,
    organization_id: int,
    dataset_id: int,
) -> Dataset | None:
    
    statement = session.scalar(
        select(Dataset)
        .where(
            Dataset.id == dataset_id, 
            Dataset.organization_id == organization_id,
        )
    )
    return statement


