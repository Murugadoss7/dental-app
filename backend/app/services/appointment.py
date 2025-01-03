from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from ..models.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentInDB,
    AppointmentReschedule,
    AppointmentResponse
)
from ..database import Database
from .doctor import DoctorService
from .appointment_settings import AppointmentSettingsService

class AppointmentService:
    def __init__(self):
        self.doctor_service = DoctorService()
        self.settings_service = AppointmentSettingsService()

    async def get_collection(self):
        """Get the appointments collection."""
        db = await Database.get_db()
        return db.appointments

    async def create_appointment(self, appointment: AppointmentCreate) -> AppointmentResponse:
        """Create a new appointment with validation."""
        # Get settings for validation
        settings = await self.settings_service.get_settings()
        if not settings:
            raise ValueError("Appointment settings not configured")

        # Validate appointment time
        start_time = appointment.start_time
        end_time = appointment.end_time
        
        # Check if appointment is within advance booking limit
        max_date = datetime.utcnow() + timedelta(days=settings.advance_booking_days)
        if start_time.date() > max_date.date():
            raise ValueError(f"Cannot book appointments more than {settings.advance_booking_days} days in advance")

        # Check if slot is available
        doctor_id = ObjectId(appointment.doctor_id)
        is_available = await self._is_slot_available(
            doctor_id,
            start_time,
            end_time
        )
        if not is_available:
            raise ValueError("Selected time slot is not available")

        # Create appointment
        collection = await self.get_collection()
        appointment_dict = appointment.model_dump()
        appointment_dict["doctor_id"] = doctor_id
        appointment_dict["patient_id"] = ObjectId(appointment.patient_id)
        appointment_dict["created_at"] = datetime.utcnow()
        appointment_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(appointment_dict)
        return await self.get_appointment(result.inserted_id)

    async def get_appointment(self, appointment_id: ObjectId) -> Optional[AppointmentResponse]:
        collection = await self.get_collection()
        appointment = await collection.find_one({"_id": appointment_id})
        if not appointment:
            return None

        # Get patient and doctor details
        db = await Database.get_db()
        patients_collection = db.patients
        doctors_collection = db.doctors

        # Get patient details - only include necessary fields
        patient = await patients_collection.find_one(
            {"_id": appointment["patient_id"]},
            {"first_name": 1, "last_name": 1}
        )
        if patient:
            patient_data = {
                "_id": str(patient["_id"]),
                "first_name": patient["first_name"],
                "last_name": patient["last_name"]
            }
        else:
            patient_data = {"_id": str(appointment["patient_id"])}
        
        # Get doctor details - only include necessary fields
        doctor = await doctors_collection.find_one(
            {"_id": appointment["doctor_id"]},
            {"first_name": 1, "last_name": 1}
        )
        if doctor:
            doctor_data = {
                "_id": str(doctor["_id"]),
                "first_name": doctor["first_name"],
                "last_name": doctor["last_name"]
            }
        else:
            doctor_data = {"_id": str(appointment["doctor_id"])}
        
        # Create response object
        appointment_data = {
            **appointment,
            "patient": patient_data,
            "doctor": doctor_data
        }
        return AppointmentResponse(**appointment_data)

    async def list_appointments(
        self,
        skip: int = 0,
        limit: int = 20,
        doctor_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[str] = None
    ) -> List[AppointmentResponse]:
        collection = await self.get_collection()
        query = {}

        if doctor_id:
            query["doctor_id"] = ObjectId(doctor_id)
        if patient_id:
            query["patient_id"] = ObjectId(patient_id)
        if status:
            query["status"] = status
        if start_date or end_date:
            query["start_time"] = {}
            if start_date:
                query["start_time"]["$gte"] = start_date
            if end_date:
                query["start_time"]["$lt"] = end_date

        cursor = collection.find(query).skip(skip).limit(limit)
        appointments = await cursor.to_list(length=limit)
        
        # Get patient and doctor details for each appointment
        db = await Database.get_db()
        patients_collection = db.patients
        doctors_collection = db.doctors
        
        result = []
        for appointment in appointments:
            # Get patient details - only include necessary fields
            patient = await patients_collection.find_one(
                {"_id": appointment["patient_id"]},
                {"first_name": 1, "last_name": 1}
            )
            if patient:
                patient_data = {
                    "_id": str(patient["_id"]),
                    "first_name": patient["first_name"],
                    "last_name": patient["last_name"]
                }
            else:
                patient_data = {"_id": str(appointment["patient_id"])}
            
            # Get doctor details - only include necessary fields
            doctor = await doctors_collection.find_one(
                {"_id": appointment["doctor_id"]},
                {"first_name": 1, "last_name": 1}
            )
            if doctor:
                doctor_data = {
                    "_id": str(doctor["_id"]),
                    "first_name": doctor["first_name"],
                    "last_name": doctor["last_name"]
                }
            else:
                doctor_data = {"_id": str(appointment["doctor_id"])}
            
            # Create response object
            appointment_data = {
                **appointment,
                "patient": patient_data,
                "doctor": doctor_data
            }
            result.append(AppointmentResponse(**appointment_data))
        
        return result

    async def update_appointment(
        self,
        appointment_id: ObjectId,
        appointment_update: AppointmentUpdate
    ) -> Optional[AppointmentResponse]:
        collection = await self.get_collection()
        update_data = appointment_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        # If updating time, validate availability
        if "start_time" in update_data or "end_time" in update_data:
            current_appointment = await self.get_appointment(appointment_id)
            if not current_appointment:
                return None

            start_time = update_data.get("start_time", current_appointment.start_time)
            end_time = update_data.get("end_time", current_appointment.end_time)
            
            is_available = await self._is_slot_available(
                current_appointment.doctor_id,
                start_time,
                end_time,
                exclude_appointment_id=appointment_id
            )
            if not is_available:
                raise ValueError("Selected time slot is not available")

        result = await collection.update_one(
            {"_id": appointment_id},
            {"$set": update_data}
        )

        if result.modified_count:
            return await self.get_appointment(appointment_id)
        return None

    async def cancel_appointment(
        self,
        appointment_id: ObjectId,
        cancelled_reason: str
    ) -> Optional[AppointmentResponse]:
        collection = await self.get_collection()
        update_data = {
            "status": "cancelled",
            "cancelled_reason": cancelled_reason,
            "updated_at": datetime.utcnow()
        }

        result = await collection.update_one(
            {"_id": appointment_id},
            {"$set": update_data}
        )

        if result.modified_count:
            return await self.get_appointment(appointment_id)
        return None

    async def reschedule_appointment(
        self,
        appointment_id: ObjectId,
        reschedule_data: AppointmentReschedule
    ) -> Optional[AppointmentResponse]:
        current_appointment = await self.get_appointment(appointment_id)
        if not current_appointment:
            return None

        # Validate new time slot
        is_available = await self._is_slot_available(
            current_appointment.doctor_id,
            reschedule_data.new_start_time,
            reschedule_data.new_end_time,
            exclude_appointment_id=appointment_id
        )
        if not is_available:
            raise ValueError("Selected time slot is not available")

        # Create new appointment
        collection = await self.get_collection()
        update_data = {
            "start_time": reschedule_data.new_start_time,
            "end_time": reschedule_data.new_end_time,
            "status": "rescheduled",
            "previous_appointment_id": current_appointment.previous_appointment_id or appointment_id,
            "updated_at": datetime.utcnow()
        }
        if reschedule_data.reason:
            update_data["reason"] = reschedule_data.reason

        result = await collection.update_one(
            {"_id": appointment_id},
            {"$set": update_data}
        )

        if result.modified_count:
            return await self.get_appointment(appointment_id)
        return None

    async def _is_slot_available(
        self,
        doctor_id: ObjectId,
        start_time: datetime,
        end_time: datetime,
        exclude_appointment_id: Optional[ObjectId] = None
    ) -> bool:
        """Check if a time slot is available for a doctor."""
        # Get doctor's availability
        settings = await self.settings_service.get_settings()
        available_slots = await self.doctor_service.get_available_slots(
            doctor_id,
            start_time.date(),
            settings.model_dump()
        )

        # Check if proposed time matches any available slot
        is_slot_match = any(
            slot["start_time"] == start_time and slot["end_time"] == end_time
            for slot in available_slots
        )
        if not is_slot_match:
            return False

        # Check for conflicts with existing appointments
        collection = await self.get_collection()
        query = {
            "doctor_id": doctor_id,
            "status": {"$in": ["scheduled", "rescheduled"]},
            "$or": [
                {
                    "start_time": {"$lt": end_time},
                    "end_time": {"$gt": start_time}
                }
            ]
        }
        if exclude_appointment_id:
            query["_id"] = {"$ne": exclude_appointment_id}

        existing_appointment = await collection.find_one(query)
        return existing_appointment is None

    async def create_indexes(self):
        """Create indexes for the appointments collection"""
        collection = await self.get_collection()
        await collection.create_index([("doctor_id", 1), ("start_time", 1)])
        await collection.create_index([("patient_id", 1), ("start_time", 1)])
        await collection.create_index([("status", 1)])
        await collection.create_index([("start_time", 1)]) 