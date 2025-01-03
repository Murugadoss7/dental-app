from datetime import datetime, time, timedelta
from typing import List, Optional
from bson import ObjectId
from ..models.doctor import DoctorCreate, DoctorUpdate, DoctorInDB
from ..database import Database

class DoctorService:
    async def get_collection(self):
        """Get the doctors collection."""
        db = await Database.get_db()
        return db.doctors

    async def create_doctor(self, doctor: DoctorCreate) -> DoctorInDB:
        collection = await self.get_collection()
        doctor_dict = doctor.model_dump()
        doctor_dict["created_at"] = datetime.utcnow()
        doctor_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(doctor_dict)
        created_doctor = await collection.find_one({"_id": result.inserted_id})
        return DoctorInDB(**created_doctor)

    async def get_doctor(self, doctor_id: ObjectId) -> Optional[DoctorInDB]:
        collection = await self.get_collection()
        doctor = await collection.find_one({"_id": doctor_id})
        if doctor:
            return DoctorInDB(**doctor)
        return None

    async def list_doctors(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None
    ) -> List[DoctorInDB]:
        collection = await self.get_collection()
        query = {}
        if search:
            query = {
                "$or": [
                    {"first_name": {"$regex": search, "$options": "i"}},
                    {"last_name": {"$regex": search, "$options": "i"}},
                    {"specialization": {"$regex": search, "$options": "i"}}
                ]
            }

        cursor = collection.find(query).skip(skip).limit(limit)
        doctors = await cursor.to_list(length=limit)
        return [DoctorInDB(**doctor) for doctor in doctors]

    async def update_doctor(
        self,
        doctor_id: ObjectId,
        doctor_update: DoctorUpdate
    ) -> Optional[DoctorInDB]:
        collection = await self.get_collection()
        update_data = doctor_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        result = await collection.update_one(
            {"_id": doctor_id},
            {"$set": update_data}
        )

        if result.modified_count:
            updated_doctor = await collection.find_one({"_id": doctor_id})
            return DoctorInDB(**updated_doctor)
        return None

    async def delete_doctor(self, doctor_id: ObjectId) -> bool:
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": doctor_id})
        return result.deleted_count > 0

    async def get_available_slots(
        self,
        doctor_id: ObjectId,
        date: datetime.date,
        settings: dict
    ) -> List[dict]:
        """Get available appointment slots for a doctor on a given date."""
        doctor = await self.get_doctor(doctor_id)
        if not doctor:
            raise ValueError("Doctor not found")

        # Get working hours for the day
        day_name = date.strftime("%A").lower()
        working_hours = next(
            (wh for wh in doctor.working_hours if wh.day.lower() == day_name and wh.is_working),
            None
        )
        if not working_hours:
            return []

        # Parse working hours
        start_time = datetime.strptime(working_hours.start_time, "%H:%M").time()
        end_time = datetime.strptime(working_hours.end_time, "%H:%M").time()

        # Get break hours for the day
        break_hours = [
            bh for bh in doctor.break_hours
            if bh.day.lower() == day_name
        ]

        # Generate slots
        slots = []
        current_time = datetime.combine(date, start_time)
        end_datetime = datetime.combine(date, end_time)
        slot_duration = timedelta(minutes=settings.get("slot_duration", 30))
        buffer_time = timedelta(minutes=settings.get("buffer_time", 5))

        while current_time + slot_duration <= end_datetime:
            # Check if slot overlaps with break time
            is_break_time = any(
                self._is_time_in_range(
                    current_time.time(),
                    datetime.strptime(bh.start_time, "%H:%M").time(),
                    datetime.strptime(bh.end_time, "%H:%M").time()
                )
                for bh in break_hours
            )

            if not is_break_time:
                slots.append({
                    "start_time": current_time,
                    "end_time": current_time + slot_duration
                })

            current_time += slot_duration + buffer_time

        return slots

    def _is_time_in_range(
        self,
        time: datetime.time,
        start: datetime.time,
        end: datetime.time
    ) -> bool:
        """Check if a time falls within a range."""
        if start <= end:
            return start <= time <= end
        else:  # Handle overnight ranges
            return time >= start or time <= end

    async def create_indexes(self):
        """Create indexes for the doctors collection"""
        collection = await self.get_collection()
        await collection.create_index([("email", 1)], unique=True)
        await collection.create_index([("contact_number", 1)])
        await collection.create_index([("last_name", 1), ("first_name", 1)]) 