from datetime import datetime
from typing import List, Optional, Annotated
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .common import PyObjectId

class WorkingHours(BaseModel):
    day: str = Field(..., description="Day of the week")
    start_time: str = Field(..., description="Start time in HH:mm format")
    end_time: str = Field(..., description="End time in HH:mm format")
    is_working: bool = Field(default=True, description="Whether the doctor works on this day")

class BreakHours(BaseModel):
    day: str = Field(..., description="Day of the week")
    start_time: str = Field(..., description="Break start time in HH:mm format")
    end_time: str = Field(..., description="Break end time in HH:mm format")

class DoctorBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    contact_number: str
    specialization: str
    working_hours: List[WorkingHours] = Field(default_factory=list)
    break_hours: List[BreakHours] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(DoctorBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_number: Optional[str] = None
    specialization: Optional[str] = None
    working_hours: Optional[List[WorkingHours]] = None
    break_hours: Optional[List[BreakHours]] = None

class DoctorInDB(DoctorBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class DoctorResponse(DoctorInDB):
    pass 