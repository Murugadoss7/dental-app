from datetime import datetime
from typing import Optional, List, Any, Annotated
from pydantic import BaseModel, EmailStr, Field, ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value, handler) -> str:
        if not isinstance(value, (str, ObjectId)):
            raise ValueError("Invalid ObjectId")
        
        if isinstance(value, str) and not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId format")
            
        return str(ObjectId(value))

    @classmethod
    def __get_pydantic_json_schema__(
        cls, 
        _schema_generator: GetJsonSchemaHandler,
        _field_schema: JsonSchemaValue
    ) -> JsonSchemaValue:
        return {"type": "string"}

class Address(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str

class MedicalHistory(BaseModel):
    condition: str
    diagnosed_date: datetime
    notes: str

class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    date_of_birth: datetime
    contact_number: str
    email: EmailStr
    address: Address
    medical_history: List[MedicalHistory] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    contact_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[Address] = None
    medical_history: Optional[List[MedicalHistory]] = None

class PatientInDB(PatientBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class PatientResponse(PatientInDB):
    pass 