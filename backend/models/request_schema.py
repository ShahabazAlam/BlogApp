import resource
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Union
from fastapi import File, Form, UploadFile


class UserBase(BaseModel):
    first_name: str = Field(None, title="User First Name", max_length=100)
    last_name: str = Field(None, title="User Last Name", max_length=100)
    email: EmailStr = Field(None, title="User Email")
    super_user = Field(False, title="Super User")

class CreateUserRole(UserBase):
    role_id:Optional[int]

class CreateUser(CreateUserRole):
    password:str   

class UpdateUser(BaseModel):
    first_name: str = Field(None, title="User First Name", max_length=100)
    last_name: str = Field(None, title="User Last Name", max_length=100)
    super_user: Optional[bool] = False
    role_id:Optional[int]

class CreateBlog(BaseModel):
    title: str = Field(None, title="Blog Title", max_length=100)
    description: str = Field(None, title="Blog Description")
    image: Optional[UploadFile] = File(None)
    user_id : int

class UpdateBlog(BaseModel):
    id: int
    title: str = Field(None, title="Blog Title", max_length=100)
    description: str = Field(None, title="Blog Description")
    image: Optional[UploadFile] = File(None)
    user_id : int

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Union[str, None] = None

class CreateRole(BaseModel):
    name: str

class CreatePermission(BaseModel):
    action: str
    resource: str
    role_id: int

