from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging
import asyncio
from .config import get_settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect_with_retry(cls, retries: int = 3, delay: int = 5) -> None:
        """Connect to MongoDB with retry mechanism"""
        settings = get_settings()
        
        for attempt in range(retries):
            try:
                if cls.client is None:
                    logger.info("Connecting to MongoDB...")
                    cls.client = AsyncIOMotorClient(settings.MONGO_URI)
                    cls.db = cls.client[settings.MONGO_DB_NAME]
                    
                    # Test the connection
                    await cls.client.admin.command('ping')
                    logger.info("Successfully connected to MongoDB!")
                    return
                    
            except Exception as e:
                if attempt == retries - 1:  # Last attempt
                    logger.error(f"Failed to connect to MongoDB after {retries} attempts: {str(e)}")
                    raise
                    
                logger.warning(f"Failed to connect to MongoDB (attempt {attempt + 1}/{retries}): {str(e)}")
                await asyncio.sleep(delay)
    
    @classmethod
    async def close(cls) -> None:
        """Close database connection"""
        if cls.client:
            logger.info("Closing MongoDB connection...")
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("MongoDB connection closed")
    
    @classmethod
    async def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance with connection check"""
        if not cls.db:
            await cls.connect_with_retry()
        return cls.db
    
    @classmethod
    async def ping(cls) -> bool:
        """Check database connection"""
        try:
            if cls.client:
                await cls.client.admin.command('ping')
                return True
        except Exception as e:
            logger.error(f"Database ping failed: {str(e)}")
            return False
        return False

# Global instance
db = DatabaseManager() 