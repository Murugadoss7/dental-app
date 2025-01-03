from fastapi import APIRouter, HTTPException
from ..models.appointment_settings import (
    AppointmentSettingsCreate,
    AppointmentSettingsUpdate,
    AppointmentSettingsResponse
)
from ..services.appointment_settings import AppointmentSettingsService

router = APIRouter(prefix="/api", tags=["appointment-settings"])
settings_service = AppointmentSettingsService()

@router.post("/appointment-settings", response_model=AppointmentSettingsResponse, status_code=201)
async def create_settings(settings: AppointmentSettingsCreate):
    try:
        return await settings_service.create_settings(settings)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/appointment-settings", response_model=AppointmentSettingsResponse)
async def get_settings():
    try:
        settings = await settings_service.get_settings()
        if not settings:
            raise HTTPException(
                status_code=404,
                detail="Appointment settings not found"
            )
        return settings
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/appointment-settings", response_model=AppointmentSettingsResponse)
async def update_settings(settings_update: AppointmentSettingsUpdate):
    try:
        updated_settings = await settings_service.update_settings(settings_update)
        if not updated_settings:
            raise HTTPException(
                status_code=404,
                detail="Appointment settings not found"
            )
        return updated_settings
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 