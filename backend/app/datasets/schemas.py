from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DatasetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    uploaded_by_user_id: int

    name: str
    original_filename: str
    file_size_bytes: int
    format: str

    status: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    imported_rows: int

    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None