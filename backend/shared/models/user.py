"""
User Model - Simple MongoDB Schema for College Portfolio
Defines user document structure for MongoDB
"""
from datetime import datetime


def create_user(name: str, email: str, password_hash: str):
    """Create a new user document"""
    return {
        "name": name,
        "email": email,
        "password": password_hash,
        "role": "student",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


def format_user_response(user):
    """Format user for API response (remove password)"""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "student"),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }
