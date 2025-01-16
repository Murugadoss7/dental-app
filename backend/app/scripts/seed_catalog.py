from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# MongoDB connection
MONGO_URI = "mongodb+srv://jmdoss7:CGSsGl2yV1qUofKR@cluster0.nzjgq.mongodb.net/dentalApp?retryWrites=true&w=majority&appName=Cluster0"

# Initial data
categories = [
    {
        "_id": ObjectId(),
        "type": "category",
        "name": "Decay",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "category",
        "name": "Periodontal",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "category",
        "name": "Endodontic",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "category",
        "name": "Prosthetic",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "category",
        "name": "Surgical",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

treatments = [
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Amalgam Filling",
        "category": "Decay",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Composite Filling",
        "category": "Decay",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Root Canal Treatment",
        "category": "Endodontic",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Scaling and Root Planing",
        "category": "Periodontal",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Crown",
        "category": "Prosthetic",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Bridge",
        "category": "Prosthetic",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": ObjectId(),
        "type": "treatment",
        "name": "Tooth Extraction",
        "category": "Surgical",
        "is_common": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

async def seed_catalog():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.dentalApp
    
    # Clear existing data
    await db.dental_catalog.delete_many({})
    
    # Insert categories
    if categories:
        await db.dental_catalog.insert_many(categories)
        print(f"Inserted {len(categories)} categories")
    
    # Insert treatments
    if treatments:
        await db.dental_catalog.insert_many(treatments)
        print(f"Inserted {len(treatments)} treatments")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_catalog()) 