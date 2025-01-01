from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.patient import PatientCreate, PatientUpdate, PatientResponse
from ..services.patient import PatientService
from bson import ObjectId

router = APIRouter()
patient_service = PatientService()

@router.post("/patients", response_model=PatientResponse, status_code=201)
async def create_patient(patient: PatientCreate):
    try:
        created_patient = await patient_service.create_patient(patient)
        return created_patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    try:
        patient = await patient_service.get_patient(ObjectId(patient_id))
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patients", response_model=List[PatientResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    try:
        patients = await patient_service.list_patients(skip, limit, search)
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: str, patient_update: PatientUpdate):
    try:
        updated_patient = await patient_service.update_patient(ObjectId(patient_id), patient_update)
        if not updated_patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return updated_patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    try:
        success = await patient_service.delete_patient(ObjectId(patient_id))
        if not success:
            raise HTTPException(status_code=404, detail="Patient not found")
        return {"message": "Patient deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 