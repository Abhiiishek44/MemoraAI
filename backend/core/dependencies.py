"""
Dependency injection for FastAPI routes.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.security import decode_token
from modules.auth.auth_services import AuthService
from shared.utils.logger import logger


# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    
    try:
        # Decode token
        token = credentials.credentials
        payload = decode_token(token)
        
        # Extract user_id from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify token type
        token_type = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        auth_service = AuthService()
        user = await auth_service.verify_token_and_get_user(user_id)
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user dependency: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
  
    # Additional checks can be added here
    return current_user


# def require_role(required_role: str):
   
#     async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
#         user_role = current_user.get("role", "student")
#         if user_role != required_role:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"Access forbidden. Required role: {required_role}"
#             )
#         return current_user
    
#     return role_checker
