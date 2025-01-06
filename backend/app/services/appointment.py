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
import logging

logger = logging.getLogger(__name__)

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
        try:
            # Get settings for validation
            settings = await self.settings_service.get_settings()
            if not settings:
                raise ValueError("Appointment settings not configured")

            # Validate appointment time
            start_time = appointment.start_time
            end_time = appointment.end_time

            # Validate time format
            if not isinstance(start_time, datetime) or not isinstance(end_time, datetime):
                raise ValueError("Invalid time format")

            # Validate appointment duration
            duration = (end_time - start_time).total_seconds() / 60
            expected_duration = settings.slot_duration + settings.buffer_time
            if duration != settings.slot_duration:
                raise ValueError(f"Appointment duration must be {settings.slot_duration} minutes")
            
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
            
        except ValueError as e:
            raise ValueError(f"Appointment validation failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to create appointment: {str(e)}")

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
        """Update an appointment with validation."""
        try:
            logger.info(f"Starting appointment update for ID: {appointment_id}")
            logger.info(f"Update data received: {appointment_update.model_dump()}")

            collection = await self.get_collection()
            update_data = appointment_update.model_dump(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()

            logger.info(f"Processed update data: {update_data}")

            # Get current appointment first
            current_appointment = await self.get_appointment(appointment_id)
            if not current_appointment:
                logger.error(f"Appointment not found: {appointment_id}")
                return None

            logger.info(f"Current appointment: {current_appointment.model_dump()}")

            # If doctor_id is being updated, validate it exists
            if "doctor_id" in update_data:
                try:
                    doctor_id = ObjectId(update_data["doctor_id"])
                    logger.info(f"Validating doctor ID: {doctor_id}")
                    doctor = await self.doctor_service.get_doctor(doctor_id)
                    if not doctor:
                        logger.error(f"Doctor not found for ID: {doctor_id}")
                        raise ValueError(f"Doctor not found for ID: {doctor_id}")
                    update_data["doctor_id"] = doctor_id
                    doctor_id_for_validation = doctor_id
                except Exception as e:
                    logger.error(f"Error validating doctor: {str(e)}")
                    raise ValueError(f"Invalid doctor ID: {str(e)}")
            else:
                # Use the current doctor_id if not updating
                doctor_id_for_validation = ObjectId(current_appointment.doctor._id)
                logger.info(f"Using current doctor ID: {doctor_id_for_validation}")

            # If updating time, validate availability
            if "start_time" in update_data or "end_time" in update_data:
                start_time = update_data.get("start_time", current_appointment.start_time)
                end_time = update_data.get("end_time", current_appointment.end_time)
                
                logger.info(f"Validating time slot: {start_time} to {end_time}")
                is_available = await self._is_slot_available(
                    doctor_id_for_validation,
                    start_time,
                    end_time,
                    exclude_appointment_id=appointment_id
                )
                if not is_available:
                    logger.error(f"Time slot not available: {start_time} to {end_time}")
                    raise ValueError("Selected time slot is not available")

            logger.info(f"Final update data: {update_data}")
            result = await collection.update_one(
                {"_id": appointment_id},
                {"$set": update_data}
            )

            if result.modified_count:
                updated = await self.get_appointment(appointment_id)
                logger.info(f"Successfully updated appointment: {updated.model_dump()}")
                return updated
            logger.warning(f"No modifications made to appointment: {appointment_id}")
            return None
        except ValueError as e:
            logger.error(f"Validation error in update_appointment: {str(e)}")
            raise ValueError(f"Appointment update failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in update_appointment: {str(e)}")
            logger.exception(e)  # This will log the full stack trace
            raise Exception(f"Failed to update appointment: {str(e)}")

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
        try:
            # Get doctor's availability
            settings = await self.settings_service.get_settings()
            logger.info("\n=== Time Slot Validation ===")
            logger.info(f"Checking availability for doctor: {doctor_id}")
            logger.info(f"Requested time slot: {start_time.isoformat()} to {end_time.isoformat()}")
            logger.info(f"Day of week: {start_time.strftime('%A')}")
            if exclude_appointment_id:
                logger.info(f"Excluding appointment: {exclude_appointment_id}")

            # Get doctor's working hours for the day
            doctor = await self.doctor_service.get_doctor(doctor_id)
            if not doctor:
                logger.error("Doctor not found")
                return False

            day_name = start_time.strftime("%A").lower()
            working_hours = next(
                (wh for wh in doctor.working_hours 
                 if wh.day.lower() == day_name and wh.is_working),
                None
            )

            if not working_hours:
                logger.warning(f"No working hours found for {day_name}")
                return False

            # Check if time is within working hours
            work_start = datetime.strptime(working_hours.start_time, "%H:%M").time()
            work_end = datetime.strptime(working_hours.end_time, "%H:%M").time()
            
            requested_start = start_time.time()
            requested_end = end_time.time()

            if not (work_start <= requested_start and requested_end <= work_end):
                logger.warning("Requested time is outside working hours")
                logger.warning(f"Working hours: {work_start} to {work_end}")
                logger.warning(f"Requested: {requested_start} to {requested_end}")
                return False

            # Check appointment duration
            duration = (end_time - start_time).total_seconds() / 60
            if duration != settings.slot_duration:
                logger.warning(f"Invalid appointment duration. Expected {settings.slot_duration} minutes, got {duration} minutes")
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

            logger.info("\nChecking for conflicting appointments:")
            logger.info(f"Query: {query}")
            
            existing_appointment = await collection.find_one(query)
            if existing_appointment:
                logger.warning(f"Found conflicting appointment:")
                logger.warning(f"Conflicting appointment ID: {existing_appointment['_id']}")
                logger.warning(f"Conflicting time: {existing_appointment['start_time'].isoformat()} to {existing_appointment['end_time'].isoformat()}")
                logger.warning(f"Status: {existing_appointment['status']}")
                return False
            else:
                logger.info("No conflicting appointments found")

            logger.info("\n✓ Time slot is available!")
            return True
        except Exception as e:
            logger.error(f"Error checking slot availability: {str(e)}")
            logger.exception(e)
            raise

    async def create_indexes(self):
        """Create indexes for the appointments collection"""
        collection = await self.get_collection()
        await collection.create_index([("doctor_id", 1), ("start_time", 1)])
        await collection.create_index([("patient_id", 1), ("start_time", 1)])
        await collection.create_index([("status", 1)])
        await collection.create_index([("start_time", 1)]) 