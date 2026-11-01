from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from ..auth.dependencies import get_current_user
from ..database.session import get_session
from ..users.models import User

from .models import Dataset
from .schemas import DatasetResponse
from .service import (
    download_dataset,
    datasets_list,
    dataset_get,
)

router = APIRouter(prefix="/organizations/{organization_id}/datasets", tags=["Datasets"])

@router.post(
    "/upload",
    status_code = status.HTTP_201_CREATED,
    response_model = DatasetResponse,
)
#Form(...) говорит: «возьми текстовое поле name из отправленной формы»
#File(...) говорит: «возьми файл из поля file»
#UploadFile - сам объект полученного файла, с которым работает код
#... - поле обязательно.
def upload_dataset(
    organization_id: int,
    file: UploadFile = File(...),
    name: str = Form(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> DatasetResponse:
    dataset = download_dataset(
        db, organization_id, current_user.id, name, file
    )
    return DatasetResponse.model_validate(dataset)


@router.get(
    "/list/",
    status_code = status.HTTP_200_OK,
    response_model = list[DatasetResponse]
)
def list_datasets(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> list[Dataset]:
    return datasets_list(db, current_user.id, organization_id)

@router.get(
    "/{dataset_id}",
    status_code = status.HTTP_200_OK,
    response_model = DatasetResponse
)
def get_dataset(
    dataset_id: int,
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dataset | None:
    return dataset_get(
        db, 
        current_user.id, 
        dataset_id, 
        organization_id
    )
