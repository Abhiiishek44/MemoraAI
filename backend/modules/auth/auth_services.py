
"""
Authentication Service Layer
Handles all authentication-related business logic.
"""
from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException, status
from bson import ObjectId

from modules.auth.auth_schema import UserRegister, UserLogin
from core.security import hash_password, verify_password, create_access_token, create_refresh_token
from shared.config.database import mongodb
from shared.utils.logger import logger
from shared.models.user import create_user, format_user_response


class AuthService:
    """Simple authentication service for portfolio project"""
    
    async def register_user(self, user_data: UserRegister) -> Dict[str, Any]:
        """Register a new user"""
        try:
            # Check if email exists
            existing_user = await mongodb.db.users.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash password
            hashed_password = hash_password(user_data.password)
            
            # Create user document
            user_doc = create_user(user_data.name, user_data.email, hashed_password)
            
            # Insert into database
            result = await mongodb.db.users.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            
            # Generate tokens
            access_token = create_access_token({"sub": str(result.inserted_id)})
            refresh_token = create_refresh_token({"sub": str(result.inserted_id)})
            
            logger.info(f"User registered: {user_data.email}")
            
            return {
                "user": format_user_response(user_doc),
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed"
            )
    
    async def login_user(self, login_data: UserLogin) -> Dict[str, Any]:
        """Login user and generate tokens"""
        try:
            # Find user
            user = await mongodb.db.users.find_one({"email": login_data.email})
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Verify password
            if not verify_password(login_data.password, user["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Generate tokens
            access_token = create_access_token({"sub": str(user["_id"])})
            refresh_token = create_refresh_token({"sub": str(user["_id"])})
            
            logger.info(f"User logged in: {login_data.email}")
            
            return {
                "user": format_user_response(user),
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Login failed"
            )
    
    async def get_user_by_id(self, user_id: str):
        """Get user by ID"""
        try:
            user = await mongodb.db.users.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return None
    
    async def verify_token_and_get_user(self, user_id: str) -> Dict[str, Any]:
        """Verify token and get user data"""
        user = await self.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return format_user_response(user)