
"""
Authentication Service Layer
Handles all authentication-related business logic.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from bson import ObjectId

from modules.auth.auth_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from core.security import hash_password, verify_password, create_access_token, create_refresh_token
from config.database import mongodb
from shared.utils.logger import logger


class AuthService:
    """
    Service layer for authentication operations.
    Follows the single responsibility principle.
    """
    
    async def register_user(self, user_data: UserRegister) -> Dict[str, Any]:
        """
        Register a new user in the system.
        
        Args:
            user_data: User registration data
            
        Returns:
            Dictionary containing user information and tokens
            
        Raises:
            HTTPException: If email already exists or registration fails
        """
        try:
            # Check if user already exists

            existing_user = await mongodb.db.users.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
              
            # Hash password
            hashed_password = hash_password(user_data.password)
            print(user_data.name)
            # Prepare user document
            user_doc = {
                "name": user_data.name,
                "email": user_data.email,
                "password": hashed_password,
                "role": "student",
                "is_active": True,
                "is_verified": False,
                "created_at": datetime.utcnow()
            }
            
            # Insert user into database
            result = await mongodb.db.users.insert_one(user_doc)
            
            if not result.inserted_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )
            
            # Fetch created user
            created_user = await mongodb.db.users.find_one({"_id": result.inserted_id})
            
            # Generate tokens
            access_token = create_access_token(data={"sub": str(created_user["_id"]), "email": created_user["email"]})
            refresh_token = create_refresh_token(data={"sub": str(created_user["_id"])})
            
            logger.info(f"User registered successfully: {user_data.email}")
            
            return {
                "user": self._format_user_response(created_user),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during user registration: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during registration"
            )
    
    async def login_user(self, login_data: UserLogin) -> Dict[str, Any]:
        """
        Authenticate user and generate tokens.
        
        Args:
            login_data: User login credentials
            
        Returns:
            Dictionary containing user information and tokens
            
        Raises:
            HTTPException: If credentials are invalid
        """
        try:
            # Find user by email
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
            
            # Check if user is active
            if not user.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )
            
            # Generate tokens
            access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
            refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
            
            # Update last login
            await mongodb.db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            logger.info(f"User logged in successfully: {login_data.email}")
            
            return {
                "user": self._format_user_response(user),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during user login: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during login"
            )
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user by ID.
        
        Args:
            user_id: User's ObjectId as string
            
        Returns:
            User document or None
        """
        try:
            user = await mongodb.db.users.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception as e:
            logger.error(f"Error fetching user by ID: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user by email.
        
        Args:
            email: User's email address
            
        Returns:
            User document or None
        """
        try:
            user = await mongodb.db.users.find_one({"email": email})
            return user
        except Exception as e:
            logger.error(f"Error fetching user by email: {str(e)}")
            return None
    
    def _format_user_response(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format user document for response (remove sensitive data).
        
        Args:
            user: User document from database
            
        Returns:
            Formatted user data
        """
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "profile_image": user.get("profile_image"),
            "role": user.get("role", "student"),
            "learning_stats": user.get("learning_stats", {
                "topics_learned": 0,
                "quizzes_taken": 0,
                "average_score": 0.0,
                "revision_completed": 0
            }),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }
    
    async def verify_token_and_get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Verify token and retrieve user data.
        
        Args:
            user_id: User ID from token
            
        Returns:
            User data
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        return self._format_user_response(user)