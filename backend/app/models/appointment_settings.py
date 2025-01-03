from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from .common import PyObjectId

class WorkingHours(BaseModel):
    start_time: str = Field(..., description="Start time in HH:mm format")
    end_time: str = Field(..., description="End time in HH:mm format")

class AppointmentSettingsBase(BaseModel):
    slot_duration: int = Field(..., gt=0, description="Duration in minutes for each appointment slot")
    buffer_time: int = Field(..., ge=0, description="Buffer time between appointments in minutes")
    advance_booking_days: int = Field(..., gt=0, description="How many days in advance appointments can be booked")
    working_days: List[str] = Field(..., min_items=1, description="Array of working days")
    working_hours: WorkingHours

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class AppointmentSettingsCreate(AppointmentSettingsBase):
    pass

class AppointmentSettingsUpdate(BaseModel):
    slot_duration: Optional[int] = None
    buffer_time: Optional[int] = None
    advance_booking_days: Optional[int] = None
    working_days: Optional[List[str]] = None
    working_hours: Optional[WorkingHours] = None

class AppointmentSettingsInDB(AppointmentSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class AppointmentSettingsResponse(AppointmentSettingsInDB):
    pass 