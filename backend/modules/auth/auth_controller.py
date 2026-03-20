
"""
Authentication Controller
Handles HTTP requests and delegates to service layer.
"""
from typing import Dict, Any
from fastapi import HTTPException, status

from modules.auth.auth_schema import UserRegister, UserLogin, RegisterResponse, LoginResponse, RefreshRequest
from modules.auth.auth_services import AuthService
from shared.utils.logger import logger


# Initialize service
auth_service = AuthService()


async def register_user(data: UserRegister) -> Dict[str, Any]:
    
    try:
        result = await auth_service.register_user(data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration controller error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


async def login_user(data: UserLogin) -> Dict[str, Any]:
    
    try:
        result = await auth_service.login_user(data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login controller error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


async def get_current_user_profile(user_id: str) -> Dict[str, Any]:
   
    try:
        user = await auth_service.verify_token_and_get_user(user_id)
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile controller error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )


async def refresh_token(data: RefreshRequest) -> Dict[str, Any]:
    """Refresh access token using refresh token."""
    try:
        result = await auth_service.refresh_access_token(data.refresh_token)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refresh controller error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


async def logout_user(user_id: str, refresh_token: str) -> Dict[str, Any]:
    """Logout user by clearing refresh token."""
    try:
        result = await auth_service.logout_user(user_id, refresh_token)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout controller error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )
        
 