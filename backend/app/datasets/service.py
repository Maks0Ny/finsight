from sqlalchemy.orm import Session
from fastapi import UploadFile

import hashlib
from pathlib import Path
from uuid import uuid4

from ..organizations.errors import (
    OrganizationForbiddenError,
    OrganizationNotFoundError,
)
from ..organizations.repository import check_role, get_organization_by_id

from .errors import DatasetFileTooLargeError, InvalidDatasetFileError, DatasetNotFoundError
from .models import Dataset
from .repository import (
    save_dataset,
    get_datasets_by_organization_id,
    get_dataset_by_dataset_id,
)

CHUNK_SIZE = 1024 * 1024          # читаем по 1 МБ
MAX_FILE_SIZE = 50 * 1024 * 1024  # лимит 50 МБ
RAW_DIRECTORY = (
    Path(__file__).resolve().parents[3] / "ml" / "data" / "raw"
)

def download_dataset(
    session: Session,
    organization_id: int,
    user_id: int,
    name: str,
    file: UploadFile,
) -> Dataset:
    
    organization = get_organization_by_id(session, organization_id)
    if organization is None:
        raise OrganizationNotFoundError()

    if organization.status != "active":
        raise OrganizationForbiddenError()

    if check_role(session, user_id, organization_id) not in {
        "owner", "analyst"
    }:
        raise OrganizationForbiddenError()
    
    
    dataset_name = name.strip()
    original_filename = (file.filename or "").replace("\\", "/").split("/")[-1]

    if (
        not dataset_name
        or len(dataset_name) > 200
        or not original_filename.lower().endswith(".csv")
        or len(original_filename) > 255
    ):
        raise InvalidDatasetFileError()

    storage_key = f"{organization_id}/{uuid4().hex}.csv"
    path = RAW_DIRECTORY / storage_key
    file_size = 0
    digest = hashlib.sha256()

    try:
        path.parent.mkdir(parents=True, exist_ok=True)

        with path.open("xb") as output:
            while chunk := file.file.read(CHUNK_SIZE):
                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise DatasetFileTooLargeError()

                output.write(chunk)
                digest.update(chunk)

        if file_size == 0:
            raise InvalidDatasetFileError()

        dataset = Dataset(
            organization_id=organization_id,
            uploaded_by_user_id=user_id,
            name=dataset_name,
            original_filename=original_filename,
            storage_key=storage_key,
            file_sha256=digest.hexdigest(),
            file_size_bytes=file_size,
            source_type="csv_upload",
            format="csv",
            status="uploaded",
        )

        save_dataset(session, dataset)
        session.flush()
        session.refresh(dataset)
        session.commit()
        return dataset

    except Exception:
        session.rollback()
        path.unlink(missing_ok=True)
        raise
    
    
def datasets_list(
    session: Session,
    user_id: int,
    organization_id: int,
) -> list[Dataset]:
    organization = get_organization_by_id(session, organization_id)
    if organization is None:
        raise OrganizationNotFoundError()

    if organization.status != "active":
        raise OrganizationForbiddenError()

    if check_role(session, user_id, organization_id) not in {
        "owner", "analyst"
    }:
        raise OrganizationForbiddenError()
    
    return get_datasets_by_organization_id(session, user_id, organization_id)


def dataset_get(
    session: Session,
    user_id: int,
    dataset_id: int,
    organization_id: int,
) -> Dataset:
    
    organization = get_organization_by_id(session, organization_id)
    if organization is None:
        raise OrganizationNotFoundError()

    if organization.status != "active":
        raise OrganizationForbiddenError()
        
    dataset = get_dataset_by_dataset_id(session, organization_id, dataset_id)
    
    if dataset is None:
        raise DatasetNotFoundError()

    return dataset  