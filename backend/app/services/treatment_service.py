from typing import List
from bson import ObjectId
from fastapi import HTTPException
from ..database import Database
from ..models.treatment import TreatmentModel, PrescriptionModel, TreatmentPlanModel
import logging

logger = logging.getLogger(__name__)

class TreatmentService:
    @property
    async def treatments_collection(self):
        db = await Database.get_db()
        return db.treatments

    @property
    async def prescriptions_collection(self):
        db = await Database.get_db()
        return db.prescriptions

    @property
    async def treatment_plans_collection(self):
        db = await Database.get_db()
        return db.treatment_plans

    async def create_treatment(self, treatment: TreatmentModel) -> TreatmentModel:
        try:
            collection = await self.treatments_collection
            treatment_dict = treatment.dict(by_alias=True, exclude={'id'})  # Exclude id field to let MongoDB generate it
            
            logger.info(f"Creating treatment with data: {treatment_dict}")
            
            # Convert string IDs to ObjectId
            treatment_dict["patient_id"] = ObjectId(treatment_dict["patient_id"])
            treatment_dict["doctor_id"] = ObjectId(treatment_dict["doctor_id"])
            
            result = await collection.insert_one(treatment_dict)
            created_treatment = await collection.find_one({"_id": result.inserted_id})
            
            if not created_treatment:
                raise HTTPException(status_code=404, detail="Failed to create treatment")
                
            return TreatmentModel(**created_treatment)
        except Exception as e:
            logger.error(f"Error creating treatment: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error creating treatment: {str(e)}")

    async def get_treatment(self, treatment_id: str) -> TreatmentModel:
        collection = await self.treatments_collection
        treatment = await collection.find_one({"_id": ObjectId(treatment_id)})
        if not treatment:
            raise HTTPException(status_code=404, detail="Treatment not found")
        return TreatmentModel(**treatment)

    async def get_patient_treatments(self, patient_id: str) -> List[TreatmentModel]:
        collection = await self.treatments_collection
        treatments = await collection.find({"patient_id": ObjectId(patient_id)}).to_list(None)
        return [TreatmentModel(**treatment) for treatment in treatments]

    async def update_treatment(self, treatment_id: str, treatment_data: dict) -> TreatmentModel:
        collection = await self.treatments_collection
        treatment = await collection.find_one({"_id": ObjectId(treatment_id)})
        if not treatment:
            raise HTTPException(status_code=404, detail="Treatment not found")
        
        await collection.update_one(
            {"_id": ObjectId(treatment_id)},
            {"$set": treatment_data}
        )
        updated_treatment = await collection.find_one({"_id": ObjectId(treatment_id)})
        return TreatmentModel(**updated_treatment)

    async def create_prescription(self, prescription: PrescriptionModel) -> PrescriptionModel:
        try:
            collection = await self.prescriptions_collection
            prescription_dict = prescription.dict(by_alias=True, exclude={'id'})
            
            logger.info(f"Creating prescription with data: {prescription_dict}")
            
            # Convert string IDs to ObjectId
            prescription_dict["treatment_id"] = ObjectId(prescription_dict["treatment_id"])
            
            result = await collection.insert_one(prescription_dict)
            created_prescription = await collection.find_one({"_id": result.inserted_id})
            
            if not created_prescription:
                raise HTTPException(status_code=404, detail="Failed to create prescription")
                
            return PrescriptionModel(**created_prescription)
        except Exception as e:
            logger.error(f"Error creating prescription: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error creating prescription: {str(e)}")

    async def get_treatment_prescriptions(self, treatment_id: str) -> List[PrescriptionModel]:
        collection = await self.prescriptions_collection
        prescriptions = await collection.find(
            {"treatment_id": ObjectId(treatment_id)}
        ).to_list(None)
        return [PrescriptionModel(**prescription) for prescription in prescriptions]

    async def create_treatment_plan(self, treatment_plan: TreatmentPlanModel) -> TreatmentPlanModel:
        try:
            collection = await self.treatment_plans_collection
            plan_dict = treatment_plan.dict(by_alias=True, exclude={'id'})
            
            logger.info(f"Creating treatment plan with data: {plan_dict}")
            
            # Convert string IDs to ObjectId
            plan_dict["patient_id"] = ObjectId(plan_dict["patient_id"])
            
            result = await collection.insert_one(plan_dict)
            created_plan = await collection.find_one({"_id": result.inserted_id})
            
            if not created_plan:
                raise HTTPException(status_code=404, detail="Failed to create treatment plan")
                
            return TreatmentPlanModel(**created_plan)
        except Exception as e:
            logger.error(f"Error creating treatment plan: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error creating treatment plan: {str(e)}")

    async def get_patient_treatment_plans(self, patient_id: str) -> List[TreatmentPlanModel]:
        collection = await self.treatment_plans_collection
        plans = await collection.find(
            {"patient_id": ObjectId(patient_id)}
        ).to_list(None)
        return [TreatmentPlanModel(**plan) for plan in plans]

    async def update_treatment_plan(self, plan_id: str, plan_data: dict) -> TreatmentPlanModel:
        collection = await self.treatment_plans_collection
        plan = await collection.find_one({"_id": ObjectId(plan_id)})
        if not plan:
            raise HTTPException(status_code=404, detail="Treatment plan not found")
        
        await collection.update_one(
            {"_id": ObjectId(plan_id)},
            {"$set": plan_data}
        )
        updated_plan = await collection.find_one({"_id": ObjectId(plan_id)})
        return TreatmentPlanModel(**updated_plan)

    async def create_indexes(self):
        treatments = await self.treatments_collection
        prescriptions = await self.prescriptions_collection
        treatment_plans = await self.treatment_plans_collection

        await treatments.create_index("patient_id")
        await treatments.create_index("doctor_id")
        await prescriptions.create_index("treatment_id")
        await treatment_plans.create_index("patient_id") 