from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.patients import router as patient_router
from .routers.appointment import router as appointment_router
from .routers.doctor import router as doctor_router
from .routers.treatments import router as treatment_router
from .routers.dental_catalog import router as dental_catalog_router
from .routers.appointment_settings import router as appointment_settings_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patient_router)
app.include_router(appointment_router)
app.include_router(doctor_router)
app.include_router(treatment_router)
app.include_router(dental_catalog_router)
app.include_router(appointment_settings_router)

@app.get("/")
async def root():
    return {"message": "Dental App API"} 