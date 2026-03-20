from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field



class UserBase(BaseModel):
    """Base schema for user data"""
    name: str = Field(..., min_length=3, max_length=50, description="Full name")
    email: EmailStr = Field(..., description="User email address")


class UserCreate(UserBase):
     pass 