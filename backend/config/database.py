"""
Database configuration and connection management.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

from core.config import settings
from shared.utils.logger import logger


class MongoDB:
    """
    MongoDB connection manager.
    Singleton pattern for database connection.
    """
    client: Optional[AsyncIOMotorClient] = None
    db = None


# Global MongoDB instance
mongodb = MongoDB()


async def connect_to_mongodb():
    """
    Establish connection to MongoDB.
    Creates indexes for users collection.
    """
    try:
        mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongodb.db = mongodb.client[settings.DATABASE_NAME]
        
        # Verify connection
        await mongodb.client.admin.command('ping')
        
        # Create indexes
        await create_indexes()
        
        logger.info(f"Connected to MongoDB successfully - Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e


async def close_mongodb_connection():
    """
    Close MongoDB connection gracefully.
    """
    if mongodb.client:
        mongodb.client.close()
        logger.info("MongoDB connection closed")


async def create_indexes():
    """
    Create database indexes for optimal performance.
    """
    try:
        # Users collection indexes
        await mongodb.db.users.create_index("email", unique=True)
        await mongodb.db.users.create_index("username", unique=True)
        await mongodb.db.users.create_index("created_at")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")


