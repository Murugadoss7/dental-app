from typing import Any
from bson import ObjectId
from pydantic import GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue

class PyObjectId(str):
    """
    Custom type for handling MongoDB ObjectId across all models.
    Inherits from str to ensure proper JSON serialization.
    """
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