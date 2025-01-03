from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from .common import PyObjectId

class AppointmentBase(BaseModel):
    patient_id: PyObjectId
    doctor_id: PyObjectId
    start_time: datetime
    end_time: datetime
    reason: str = Field(..., min_length=1)
    notes: str = ""
    status: Literal["scheduled", "completed", "cancelled", "rescheduled"] = "scheduled"
    cancelled_reason: Optional[str] = None
    previous_appointment_id: Optional[PyObjectId] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    start_time: datetime
    end_time: datetime
    reason: str
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[Literal["scheduled", "completed", "cancelled", "rescheduled"]] = None

class AppointmentCancel(BaseModel):
    cancelled_reason: str = Field(..., min_length=1)

class AppointmentReschedule(BaseModel):
    new_start_time: datetime
    new_end_time: datetime
    reason: Optional[str] = None

class AppointmentInDB(AppointmentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class ParticipantInfo(BaseModel):
    _id: str
    first_name: str
    last_name: str

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class AppointmentResponse(AppointmentInDB):
    patient: ParticipantInfo
    doctor: ParticipantInfo

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    ) 