from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..models.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from ..services.doctor import DoctorService

router = APIRouter(prefix="/api", tags=["doctors"])
doctor_service = DoctorService()

@router.post("/doctors", response_model=DoctorResponse, status_code=201)
async def create_doctor(doctor: DoctorCreate):
    try:
        return await doctor_service.create_doctor(doctor)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/doctors", response_model=List[DoctorResponse])
async def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    try:
        return await doctor_service.list_doctors(skip, limit, search)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: str):
    try:
        doctor = await doctor_service.get_doctor(ObjectId(doctor_id))
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(doctor_id: str, doctor_update: DoctorUpdate):
    try:
        updated_doctor = await doctor_service.update_doctor(
            ObjectId(doctor_id),
            doctor_update
        )
        if not updated_doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return updated_doctor
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    try:
        success = await doctor_service.delete_doctor(ObjectId(doctor_id))
        if not success:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"message": "Doctor deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/doctors/{doctor_id}/available-slots")
async def get_available_slots(
    doctor_id: str,
    date: datetime = Query(..., description="Date to check availability (YYYY-MM-DD)")
):
    try:
        from ..services.appointment_settings import AppointmentSettingsService
        settings_service = AppointmentSettingsService()
        settings = await settings_service.get_settings()
        if not settings:
            raise HTTPException(
                status_code=400,
                detail="Appointment settings not configured"
            )

        slots = await doctor_service.get_available_slots(
            ObjectId(doctor_id),
            date,
            settings.model_dump()
        )
        return {
            "date": date.date().isoformat(),
            "slots": [
                {
                    "start_time": slot["start_time"].isoformat(),
                    "end_time": slot["end_time"].isoformat()
                }
                for slot in slots
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 