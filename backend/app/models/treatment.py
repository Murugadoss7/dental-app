from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from .common import PyObjectId
from bson import ObjectId

class TeethGroup(BaseModel):
    group: str = Field(..., description="'upper' or 'lower'")
    numbers: List[str] = Field(..., description="List of tooth numbers")

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

class TreatmentPlanItemModel(BaseModel):
    finding_id: Optional[str] = Field(None, description="Link to clinical finding if created from finding")
    treatment_name: str
    teeth_involved: Optional[TeethGroup] = None
    category: str
    finding_notes: Optional[str] = None
    treatment_remarks: Optional[str] = None
    estimated_cost: Optional[float] = None
    scheduled_date: Optional[datetime] = None
    status: str = Field(..., pattern='^(planned|in_progress|completed|cancelled)$')
    priority: str = Field(..., pattern='^(high|medium|low)$')

class TreatmentPlanModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    patient_id: PyObjectId = Field(...)
    treatments: List[TreatmentPlanItemModel] = Field(default_factory=list)
    start_date: datetime
    end_date: Optional[datetime] = None
    total_cost: Optional[float] = Field(default=0, description="Total estimated cost of all treatments")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

class Issue(BaseModel):
    id: Optional[str] = Field(None, description="Catalog ID if from predefined list")
    name: str = Field(..., description="Name of the issue")
    is_custom: bool = Field(default=False, description="Whether this is a custom issue")

class RecommendedTreatment(BaseModel):
    id: Optional[str] = Field(None, description="Catalog ID if from predefined list")
    name: str = Field(..., description="Name of the treatment")
    is_custom: bool = Field(default=False, description="Whether this is a custom treatment")

class ClinicalFindingGroup(BaseModel):
    id: str = Field(..., description="Unique identifier for the finding group")
    teeth: TeethGroup = Field(..., description="Grouped teeth information")
    issue: Issue = Field(..., description="Dental issue information")
    finding: str = Field(..., description="Clinical finding description")
    recommended_treatment: RecommendedTreatment = Field(..., description="Recommended treatment")

class TreatmentModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    patient_id: PyObjectId = Field(...)
    doctor_id: PyObjectId = Field(...)
    date: datetime = Field(default_factory=datetime.utcnow)
    chief_complaint: str
    diagnosis: str
    clinical_findings: List[ClinicalFindingGroup] = Field(default_factory=list)
    treatment_notes: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {PyObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

class DentalCatalogItem(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    type: str = Field(..., description="'treatment' or 'category'")
    name: str = Field(..., description="Name of the item")
    description: Optional[str] = None
    is_common: bool = Field(default=True, description="Whether this is a commonly used item")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True 