from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import Database
from .routers import doctor_router, appointment_router, appointment_settings_router, patients_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    try:
        await Database.connect_db()
        
        # Create indexes
        from .services.doctor import DoctorService
        from .services.appointment import AppointmentService
        from .services.patient import PatientService
        
        doctor_service = DoctorService()
        appointment_service = AppointmentService()
        patient_service = PatientService()
        
        await doctor_service.create_indexes()
        await appointment_service.create_indexes()
        await patient_service.create_indexes()
        print("Created database indexes!")
        
        yield
    except Exception as e:
        print(f"Error during startup: {e}")
        raise
    finally:
        # Shutdown: Close MongoDB connection
        await Database.close_db()

app = FastAPI(
    title="Dental App API",
    description="API for Dental Clinic Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(doctor_router)
app.include_router(appointment_router)
app.include_router(appointment_settings_router)
app.include_router(patients_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Dental App API",
        "docs": "/docs",
        "redoc": "/redoc"
    } 