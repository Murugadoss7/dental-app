from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from ..models.patient import PatientCreate, PatientUpdate, PatientInDB
from ..database import Database

class PatientService:
    @property
    async def collection(self):
        db = await Database.get_db()
        return db.patients

    async def create_patient(self, patient: PatientCreate) -> PatientInDB:
        collection = await self.collection
        patient_dict = patient.model_dump()
        patient_dict["created_at"] = datetime.utcnow()
        patient_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.insert_one(patient_dict)
        created_patient = await collection.find_one({"_id": result.inserted_id})
        return PatientInDB(**created_patient)

    async def get_patient(self, patient_id: ObjectId) -> Optional[PatientInDB]:
        collection = await self.collection
        patient = await collection.find_one({"_id": patient_id})
        if patient:
            return PatientInDB(**patient)
        return None

    async def list_patients(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        search: Optional[str] = None
    ) -> List[PatientInDB]:
        collection = await self.collection
        query = {}
        if search:
            query = {
                "$or": [
                    {"first_name": {"$regex": search, "$options": "i"}},
                    {"last_name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}}
                ]
            }

        cursor = collection.find(query).skip(skip).limit(limit)
        patients = await cursor.to_list(length=limit)
        
        # Properly format each patient document
        formatted_patients = []
        for patient in patients:
            # Ensure medical_history is a list
            if "medical_history" not in patient or not isinstance(patient["medical_history"], list):
                patient["medical_history"] = []
            
            # Convert string dates to datetime objects
            if "date_of_birth" in patient and isinstance(patient["date_of_birth"], str):
                patient["date_of_birth"] = datetime.fromisoformat(patient["date_of_birth"].replace("Z", "+00:00"))
            
            # Convert medical history dates
            for history in patient["medical_history"]:
                if isinstance(history.get("diagnosed_date"), str):
                    history["diagnosed_date"] = datetime.fromisoformat(history["diagnosed_date"].replace("Z", "+00:00"))
            
            try:
                formatted_patients.append(PatientInDB(**patient))
            except Exception as e:
                print(f"Error formatting patient {patient.get('_id')}: {str(e)}")
                continue
                
        return formatted_patients

    async def update_patient(
        self, 
        patient_id: ObjectId, 
        patient_update: PatientUpdate
    ) -> Optional[PatientInDB]:
        collection = await self.collection
        update_data = patient_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        result = await collection.update_one(
            {"_id": patient_id},
            {"$set": update_data}
        )

        if result.modified_count:
            updated_patient = await collection.find_one({"_id": patient_id})
            return PatientInDB(**updated_patient)
        return None

    async def delete_patient(self, patient_id: ObjectId) -> bool:
        collection = await self.collection
        result = await collection.delete_one({"_id": patient_id})
        return result.deleted_count > 0

    async def create_indexes(self):
        """Create indexes for the patients collection"""
        collection = await self.collection
        await collection.create_index([("email", 1)], unique=True, sparse=True)
        await collection.create_index([("contact_number", 1)])
        await collection.create_index([("last_name", 1), ("first_name", 1)]) 