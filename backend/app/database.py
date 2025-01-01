from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import Config

class Database:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    @classmethod
    async def connect_db(cls) -> None:
        """Create database connection."""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(Config.MONGO_URI)
            cls.db = cls.client.dentalApp
            await cls.client.admin.command('ping')
            print("Connected to MongoDB!")

    @classmethod
    async def close_db(cls) -> None:
        """Close database connection."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            print("Closed MongoDB connection.")

    @classmethod
    async def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if cls.db is None:
            await cls.connect_db()
        if cls.db is None:
            raise Exception("Database connection failed")
        return cls.db 