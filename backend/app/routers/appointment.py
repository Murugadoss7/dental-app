from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..models.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentCancel,
    AppointmentReschedule
)
from ..services.appointment import AppointmentService

router = APIRouter(prefix="/api", tags=["appointments"])
appointment_service = AppointmentService()

@router.post("/appointments", response_model=AppointmentResponse, status_code=201)
async def create_appointment(appointment: AppointmentCreate):
    try:
        return await appointment_service.create_appointment(appointment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/appointments", response_model=List[AppointmentResponse])
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    doctor_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None
):
    try:
        appointments = await appointment_service.list_appointments(
            skip=skip,
            limit=limit,
            doctor_id=doctor_id,
            patient_id=patient_id,
            start_date=start_date,
            end_date=end_date,
            status=status
        )
        return appointments
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: str):
    try:
        appointment = await appointment_service.get_appointment(ObjectId(appointment_id))
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appointment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(appointment_id: str, appointment_update: AppointmentUpdate):
    try:
        updated_appointment = await appointment_service.update_appointment(
            ObjectId(appointment_id),
            appointment_update
        )
        if not updated_appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return updated_appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointments/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(appointment_id: str, cancel_data: AppointmentCancel):
    try:
        cancelled_appointment = await appointment_service.cancel_appointment(
            ObjectId(appointment_id),
            cancel_data.cancelled_reason
        )
        if not cancelled_appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return cancelled_appointment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/appointments/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: str,
    reschedule_data: AppointmentReschedule
):
    try:
        rescheduled_appointment = await appointment_service.reschedule_appointment(
            ObjectId(appointment_id),
            reschedule_data
        )
        if not rescheduled_appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return rescheduled_appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 