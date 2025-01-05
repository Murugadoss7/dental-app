from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..models.treatment import TreatmentModel, PrescriptionModel, TreatmentPlanModel
from ..services.treatment_service import TreatmentService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["treatments"]
)

def get_treatment_service():
    return TreatmentService()

@router.post("/treatments", response_model=TreatmentModel)
async def create_treatment(
    treatment: TreatmentModel,
    service: TreatmentService = Depends(get_treatment_service)
):
    try:
        logger.info(f"Received treatment creation request: {treatment.dict()}")
        return await service.create_treatment(treatment)
    except Exception as e:
        logger.error(f"Error in create_treatment endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/treatments/patient/{patient_id}", response_model=List[TreatmentModel])
async def get_patient_treatments(
    patient_id: str,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.get_patient_treatments(patient_id)

@router.get("/treatments/{treatment_id}", response_model=TreatmentModel)
async def get_treatment(
    treatment_id: str,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.get_treatment(treatment_id)

@router.put("/treatments/{treatment_id}", response_model=TreatmentModel)
async def update_treatment(
    treatment_id: str,
    treatment_data: dict,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.update_treatment(treatment_id, treatment_data)

@router.post("/treatments/prescriptions", response_model=PrescriptionModel)
async def create_prescription(
    prescription: PrescriptionModel,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.create_prescription(prescription)

@router.get("/treatments/prescriptions/{treatment_id}", response_model=List[PrescriptionModel])
async def get_treatment_prescriptions(
    treatment_id: str,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.get_treatment_prescriptions(treatment_id)

@router.post("/treatments/plans", response_model=TreatmentPlanModel)
async def create_treatment_plan(
    treatment_plan: TreatmentPlanModel,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.create_treatment_plan(treatment_plan)

@router.get("/treatments/plans/patient/{patient_id}", response_model=List[TreatmentPlanModel])
async def get_patient_treatment_plans(
    patient_id: str,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.get_patient_treatment_plans(patient_id)

@router.put("/treatments/plans/{plan_id}", response_model=TreatmentPlanModel)
async def update_treatment_plan(
    plan_id: str,
    plan_data: dict,
    service: TreatmentService = Depends(get_treatment_service)
):
    return await service.update_treatment_plan(plan_id, plan_data) 