from pydantic import BaseModel, EmailStr, Field

class UserCreateRequest(BaseModel):
    email: EmailStr = Field(..., max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    
    name: str = Field(..., max_length=50)
    second_name: str = Field(..., max_length=50)
    middle_name: str | None = Field(None, max_length=50)
    
    created_at: str
    updated_at: str
    registered_at: str
    

class UserProfileUpdateRequest(BaseModel):
    name: str | None = Field(None, max_length=50)
    second_name: str | None = Field(None, max_length=50)
    middle_name: str | None = Field(None, max_length=50)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    
    name: str
    second_name: str
    middle_name: str | None
