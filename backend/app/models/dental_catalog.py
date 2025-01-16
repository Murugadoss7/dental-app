from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .common import PyObjectId

class DentalCatalogModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    type: str = Field(..., description="Type of catalog item: 'issue' or 'treatment'")
    name: str = Field(..., description="Name of the dental issue or treatment")
    category: str = Field(..., description="Category for grouping similar items")
    is_common: bool = Field(default=True, description="Whether this is a commonly used item")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {PyObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True 