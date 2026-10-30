from pydantic import BaseModel, ConfigDict, Field
from typing import Literal 
from datetime import datetime

class OrganizationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True) #extra="forbid": если клиент пришлёт поле, которого нет в схеме Pydantic отклонит запрос с 422. str_strip_whitespace=True: убирает пробелы по краям строк

    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(
        min_length=3,
        max_length=100,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    base_currency: str = Field(default="RUB", pattern=r"^[A-Z]{3}$")
    timezone: str = Field(default="Europe/Moscow", max_length=64)
    language: str = Field(default="ru", max_length=16)
    

class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True) # Разрешает Pydantic читать поля из атрибутов объекта

    id: int
    name: str
    slug: str
    base_currency: str
    status: str
    timezone: str
    language: str
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    
    
class OrganizationMemberResponse(BaseModel):
    user_id: int
    name: str
    second_name: str
    role: str
    
    
class AddMemberRequest(BaseModel):
    user_id: int = Field(gt=0) # Числовое значение должно быть строго больше нуля (greater than)
    role: Literal["analyst", "viewer"] # Cюда разрешено передавать только вот эти конкретные строки