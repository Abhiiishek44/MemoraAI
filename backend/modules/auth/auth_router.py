"""
Authentication Router
Defines API endpoints for authentication.
"""
from fastapi import APIRouter, Depends, status
from typing import Dict, Any

from modules.auth.auth_schema import (
    UserRegister, 
    UserLogin, 
    UserResponse,
    RegisterResponse,
    LoginResponse,
    RefreshRequest
)
from modules.auth.auth_services import AuthService
from core.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

auth_service = AuthService()


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=RegisterResponse,
    summary="Register a new user",
    description="Create a new user account with email and password"
)
async def register(data: UserRegister) -> Dict[str, Any]:
    """
    Register a new user.
    
    - **username**: Unique username (3-50 characters, alphanumeric + underscore)
    - **email**: Valid email address
    - **password**: Strong password (min 8 chars, with uppercase, lowercase, and digit)
    
    Returns user data with access and refresh tokens.
    """
    return await auth_service.register_user(data)


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=LoginResponse,
    summary="Login user",
    description="Authenticate user and receive access tokens"
)
async def login(data: UserLogin) -> Dict[str, Any]:
    """
    Login with email and password.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns user data with access and refresh tokens.
    """
    return await auth_service.login_user(data)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve authenticated user's profile information"
)
async def get_profile(current_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get current authenticated user profile.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout current user (client-side token removal)"
)
async def logout(data: RefreshRequest, current_user: dict = Depends(get_current_user)) -> Dict[str, str]:
    """
    Logout user.
    
    Since we're using JWT tokens, logout is handled client-side by removing the token.
    This endpoint verifies the token is valid before confirming logout.
    """
    user_id = str(current_user.get("id") or current_user.get("_id"))
    return await auth_service.logout_user(user_id, data.refresh_token)


@router.get(
    "/verify",
    status_code=status.HTTP_200_OK,
    summary="Verify token",
    description="Verify if the current token is valid"
)
async def verify_token(current_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Verify if the provided token is valid.
    
    Returns user information if token is valid.
    """
    return {
        "valid": True,
        "user": current_user
    }


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=LoginResponse,
    summary="Refresh access token",
    description="Use a refresh token to obtain new access and refresh tokens"
)
async def refresh_token(data: RefreshRequest) -> Dict[str, Any]:
    """Refresh tokens using a valid refresh token."""
    return await auth_service.refresh_access_token(data.refresh_token)