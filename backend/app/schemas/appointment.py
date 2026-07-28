from datetime import date
from enum import Enum
from pydantic import BaseModel
from app.schemas.doctor import DoctorBasicResponse
from app.schemas.patient import PatientBasicResponse

# 1. Define the Enum FIRST so it can be used below
class AppointmentStatus(str, Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: str


class AppointmentResponse(BaseModel):
    appointment_id: int
    doctor: DoctorBasicResponse
    patient: PatientBasicResponse
    appointment_date: date
    appointment_time: str
    status: AppointmentStatus  # ✅ Updated to use Enum

    class Config:
        from_attributes = True


class AppointmentUpdate(BaseModel):
    patient_id: int | None = None
    doctor_id: int | None = None
    appointment_date: date | None = None
    appointment_time: str | None = None
    status: AppointmentStatus | None = None  # ✅ Updated to use Enum and allow None