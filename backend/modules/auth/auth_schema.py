"""
Authentication Schemas
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """Schema for user registration"""
    name: str = Field(..., min_length=3, max_length=50, description="Full name")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """Schema for user response (excludes sensitive data)"""
    id: str
    name: str
    email: EmailStr
    profile_image: Optional[str] = None
    role: str = "student"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Replaces orm_mode in Pydantic v2


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Schema for login response"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RegisterResponse(BaseModel):
    """Schema for registration response"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Schema for requesting a new token using a refresh token"""
    refresh_token: str


class TokenPayload(BaseModel):
    """Schema for JWT token payload"""
    sub: str  # Subject (user_id)
    email: Optional[str] = None
    exp: Optional[int] = None  # Expiration time
    iat: Optional[int] = None  # Issued at
    type: Optional[str] = None  # Token type (access/refresh)