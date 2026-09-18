from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr = Field(..., max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    
    

class UserUpdate(BaseModel):
    pass

