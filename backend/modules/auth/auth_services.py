
"""
Authentication Service Layer
Handles all authentication-related business logic.
"""
from typing import Dict, Any
from fastapi import HTTPException, status
from bson import ObjectId

from modules.auth.auth_schema import UserRegister, UserLogin
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
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
            user_id = str(result.inserted_id)

            # Generate tokens
            access_token = create_access_token({"sub": user_id})
            refresh_token = create_refresh_token({"sub": user_id})

            # Store refresh token in DB
            await mongodb.db.users.update_one(
                {"_id": result.inserted_id},
                {"$set": {"refresh_token": refresh_token}}
            )
           
            user_doc["_id"] = result.inserted_id

            logger.info(f"User registered: {user_data.email}")

            return {
                "user": format_user_response(user_doc),
                "access_token": access_token,
                "refresh_token": refresh_token,
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

            # Store refresh token for session revocation
            await mongodb.db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"refresh_token": refresh_token}}
            )

            logger.info(f"User logged in: {login_data.email}")
            
            return {
                "user": format_user_response(user),
                "access_token": access_token,
                "refresh_token": refresh_token,
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
    

    async def logout_user(self, user_id: str, refresh_token: str) -> Dict[str, str]:
        """Logout user by clearing refresh token"""
        try:
            user = await mongodb.db.users.find_one({"_id": ObjectId(user_id)})

            if not user or user.get("refresh_token") != refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or user not found"
                )
            
            await mongodb.db.users.update_one(
                {"_id": ObjectId(user_id), "refresh_token": refresh_token},
                {"$unset": {"refresh_token": ""}}
            )
            logger.info(f"User logged out: {user_id}")
            return {
                "message": "Successfully logged out",
                "detail": "Please remove the token from client storage"
            }
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed"
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

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Validate refresh token and issue new access token"""
        try:
            payload = decode_token(refresh_token)
            token_type = payload.get("type")
            if token_type != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )

            user_id: str = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )

            user = await self.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )

            if user.get("refresh_token") != refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token does not match"
                )

            new_access = create_access_token({"sub": str(user_id)})
            new_refresh = create_refresh_token({"sub": str(user_id)})

            await mongodb.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"refresh_token": new_refresh}}
            )

            return {
                "user": format_user_response(user),
                "access_token": new_access,
                "refresh_token": new_refresh,
                "token_type": "bearer"
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Refresh token error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not refresh token"
            )