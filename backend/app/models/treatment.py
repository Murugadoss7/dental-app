from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from .common import PyObjectId
from bson import ObjectId

class MedicationModel(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: str

class PrescriptionModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    treatment_id: PyObjectId = Field(...)
    medications: List[MedicationModel]
    date: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

class ProcedureModel(BaseModel):
    description: str
    estimated_cost: float
    status: str = Field(..., pattern='^(planned|completed|cancelled)$')
    priority: str = Field(..., pattern='^(high|medium|low)$')

class TreatmentPlanModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    patient_id: PyObjectId = Field(...)
    procedures: List[ProcedureModel]
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

class TreatmentModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    patient_id: PyObjectId = Field(...)
    doctor_id: PyObjectId = Field(...)
    date: datetime = Field(default_factory=datetime.utcnow)
    chief_complaint: str
    diagnosis: str
    clinical_findings: str
    treatment_notes: str
    teeth_involved: List[str]
    attachments: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True 