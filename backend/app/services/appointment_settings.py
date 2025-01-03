from datetime import datetime
from typing import Optional
from bson import ObjectId
from ..models.appointment_settings import (
    AppointmentSettingsCreate,
    AppointmentSettingsUpdate,
    AppointmentSettingsInDB
)
from ..database import Database

class AppointmentSettingsService:
    async def get_collection(self):
        """Get the appointment settings collection."""
        db = await Database.get_db()
        return db.appointment_settings

    async def create_settings(self, settings: AppointmentSettingsCreate) -> AppointmentSettingsInDB:
        """Create appointment settings. Only one settings document should exist."""
        collection = await self.get_collection()
        
        # Check if settings already exist
        existing_settings = await collection.find_one({})
        if existing_settings:
            raise ValueError("Appointment settings already exist. Use update instead.")

        settings_dict = settings.model_dump()
        settings_dict["created_at"] = datetime.utcnow()
        settings_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(settings_dict)
        created_settings = await collection.find_one({"_id": result.inserted_id})
        return AppointmentSettingsInDB(**created_settings)

    async def get_settings(self) -> Optional[AppointmentSettingsInDB]:
        """Get the current appointment settings."""
        collection = await self.get_collection()
        settings = await collection.find_one({})
        if settings:
            return AppointmentSettingsInDB(**settings)
        return None

    async def update_settings(
        self,
        settings_update: AppointmentSettingsUpdate
    ) -> Optional[AppointmentSettingsInDB]:
        """Update the current appointment settings."""
        collection = await self.get_collection()
        
        # Get current settings
        current_settings = await collection.find_one({})
        if not current_settings:
            raise ValueError("No appointment settings found. Create settings first.")

        update_data = settings_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        result = await collection.update_one(
            {"_id": current_settings["_id"]},
            {"$set": update_data}
        )

        if result.modified_count:
            updated_settings = await collection.find_one({"_id": current_settings["_id"]})
            return AppointmentSettingsInDB(**updated_settings)
        return None

    async def create_indexes(self):
        """Create indexes for the appointment_settings collection"""
        # No specific indexes needed for settings as it's a single document collection
        pass 