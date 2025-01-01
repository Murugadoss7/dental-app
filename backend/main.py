from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.database import Database
from app.services.patient import PatientService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    try:
        await Database.connect_db()
        
        # Create indexes on startup
        patient_service = PatientService()
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
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers import patients

app.include_router(patients.router, prefix="/api", tags=["patients"])

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Dental App API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 