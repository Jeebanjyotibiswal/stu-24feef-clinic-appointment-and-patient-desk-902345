from fastapi import FastAPI, Depends  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text

from app.database import Base, engine, SessionLocal
import app.models
from app.api.doctor import router as doctor_router
from app.api.auth import router as auth_router
from app.dependencies.roles import require_role
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.api.patient import router as patient_router
from app.api.appointment import router as appointment_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

with engine.begin() as connection:
    try:
        connection.execute(text("ALTER TABLE patients ALTER COLUMN blood_group TYPE VARCHAR(20)"))
    except Exception:
        pass

app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(patient_router)
app.include_router(appointment_router)
@app.get("/")
def home():
    return {"message": "Backend Running"}


@app.get("/health")
def health():
    return {"ok": True, "stack": "python", "service": "api"}


@app.get("/api/ping")
def ping():
    return {"ok": True, "message": "pong"}


@app.get("/api/version")
def version():
    return {"runtime": "python", "deploy_target": "render", "version": "starter-v1"}



@app.get("/dashboard")
def dashboard(
    current_user=Depends(require_role(["Admin"]))
):
    return {
        "message": f"Welcome {current_user['sub']}",
        "role": current_user["role"]
    }





@app.get("/admin/dashboard")
def admin_dashboard(
    current_user=Depends(require_role(["Admin"]))
):
    return {
        "message": f"Welcome Admin {current_user['sub']}"
    }


@app.get("/admin/stats")
def admin_stats(current_user=Depends(require_role(["Admin"]))):
    db = SessionLocal()
    try:
        doctor_count = db.query(func.count(Doctor.doctor_id)).scalar() or 0
        patient_count = db.query(func.count(Patient.patient_id)).scalar() or 0
        appointment_count = db.query(func.count(Appointment.appointment_id)).scalar() or 0
        return {
            "doctors": int(doctor_count),
            "patients": int(patient_count),
            "appointments": int(appointment_count)
        }
    finally:
        db.close()


@app.get("/doctor/dashboard")
def doctor_dashboard(
    current_user=Depends(require_role(["Doctor"]))
):
    return {
        "message": f"Welcome Doctor {current_user['sub']}"
    }


@app.get("/receptionist/dashboard")
def receptionist_dashboard(
    current_user=Depends(require_role(["Receptionist"]))
):
    return {
        "message": f"Welcome Receptionist {current_user['sub']}"
    }


