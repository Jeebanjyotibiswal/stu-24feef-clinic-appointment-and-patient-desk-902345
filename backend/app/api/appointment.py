from fastapi import APIRouter, Depends, HTTPException
from datetime import date, time, datetime
from sqlalchemy.orm import Session, joinedload
from app.database import SessionLocal
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.dependencies.roles import require_role
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
    AppointmentStatus
)

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appointment: AppointmentCreate,
    current_user=Depends(require_role(["Admin", "Receptionist"]))
):
    db = SessionLocal()

    try:
        # 1. VALIDATION: Check if appointment date is in the past
        if appointment.appointment_date < date.today():
            raise HTTPException(
                status_code=400,
                detail="Appointment date cannot be in the past"
            )

        # 2. VALIDATION: Convert string time to Python time and check clinic hours
        clinic_open = time(9, 0)     # 09:00 AM
        clinic_close = time(18, 0)   # 06:00 PM

        raw_time = appointment.appointment_time or ""
        if raw_time.lower() == "string":
            raise HTTPException(
                status_code=400,
                detail="Please provide a valid appointment time in HH:MM:SS format"
            )

        parsed_time = None
        for fmt in ("%H:%M:%S", "%H:%M"):
            try:
                parsed_time = datetime.strptime(raw_time, fmt).time()
                break
            except ValueError:
                continue

        if parsed_time is None:
            raise HTTPException(
                status_code=400,
                detail="Please provide a valid appointment time in HH:MM:SS format"
            )

        appointment_time = parsed_time

        if (
            appointment_time < clinic_open
            or appointment_time > clinic_close
        ):
            raise HTTPException(
                status_code=400,
                detail="Appointment time must be between 09:00 AM and 06:00 PM"
            )

        # 3. Check if Patient exists
        patient = db.query(Patient).filter(Patient.patient_id == appointment.patient_id).first()
        if patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")

        # 4. Check if Doctor exists
        doctor = db.query(Doctor).filter(Doctor.doctor_id == appointment.doctor_id).first()
        if doctor is None:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # 5. Check for Doctor Duplicate
        existing_doctor_appointment = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.appointment_time == appointment.appointment_time
        ).first()

        if existing_doctor_appointment:
            raise HTTPException(status_code=400, detail="Doctor already has an appointment at this time")

        # 6. Check for Patient Duplicate
        existing_patient_appointment = db.query(Appointment).filter(
            Appointment.patient_id == appointment.patient_id,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.appointment_time == appointment.appointment_time
        ).first()

        if existing_patient_appointment:
            raise HTTPException(status_code=400, detail="Patient already has an appointment at this time")

        # 7. Create the new appointment
        new_appointment = Appointment(
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            appointment_date=appointment.appointment_date,
            appointment_time=appointment.appointment_time,
            status=AppointmentStatus.SCHEDULED
        )

        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)

        # 8. Pre-load relationships while session is still open
        created_appointment = (
            db.query(Appointment)
            .filter(Appointment.appointment_id == new_appointment.appointment_id)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .first()
        )

        return created_appointment

    finally:
        db.close()

@router.get("/", response_model=list[AppointmentResponse])
def get_all_appointments(
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointments = (
            db.query(Appointment)
            .options(
                joinedload(Appointment.doctor),
                joinedload(Appointment.patient)
            )
            .all()
        )
        return appointments
    finally:
        db.close()

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointment = (
            db.query(Appointment)
            .filter(Appointment.appointment_id == appointment_id)
            .options(
                joinedload(Appointment.doctor),
                joinedload(Appointment.patient)
            )
            .first()
        )

        if appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")

        return appointment
    finally:
        db.close()

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        db_appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

        if db_appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # 🔥 VALIDATION: Prevent status change if appointment is already Completed or Cancelled
        if (
            appointment.status is not None
            and db_appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]
            and appointment.status != db_appointment.status
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot change status from {db_appointment.status}"
            )

        # Validate optional relationships
        if appointment.patient_id is not None and appointment.patient_id != db_appointment.patient_id:
            patient = db.query(Patient).filter(Patient.patient_id == appointment.patient_id).first()
            if patient is None:
                raise HTTPException(status_code=404, detail="Patient not found")
            db_appointment.patient_id = appointment.patient_id

        if appointment.doctor_id is not None and appointment.doctor_id != db_appointment.doctor_id:
            doctor = db.query(Doctor).filter(Doctor.doctor_id == appointment.doctor_id).first()
            if doctor is None:
                raise HTTPException(status_code=404, detail="Doctor not found")
            db_appointment.doctor_id = appointment.doctor_id

        # Use existing values for conflict validation when fields are not sent
        new_date = appointment.appointment_date or db_appointment.appointment_date
        new_time = appointment.appointment_time or db_appointment.appointment_time
        new_doctor_id = appointment.doctor_id or db_appointment.doctor_id
        new_patient_id = appointment.patient_id or db_appointment.patient_id

        # Check doctor schedule conflict for the new appointment slot
        existing_doctor_appointment = db.query(Appointment).filter(
            Appointment.doctor_id == new_doctor_id,
            Appointment.appointment_date == new_date,
            Appointment.appointment_time == new_time,
            Appointment.appointment_id != appointment_id
        ).first()

        if existing_doctor_appointment:
            raise HTTPException(status_code=400, detail="Doctor already has an appointment at this time")

        # Check patient schedule conflict for the new appointment slot
        existing_patient_appointment = db.query(Appointment).filter(
            Appointment.patient_id == new_patient_id,
            Appointment.appointment_date == new_date,
            Appointment.appointment_time == new_time,
            Appointment.appointment_id != appointment_id
        ).first()

        if existing_patient_appointment:
            raise HTTPException(status_code=400, detail="Patient already has an appointment at this time")

        if appointment.appointment_date is not None:
            db_appointment.appointment_date = appointment.appointment_date

        if appointment.appointment_time is not None:
            db_appointment.appointment_time = appointment.appointment_time

        if appointment.status is not None:
            db_appointment.status = appointment.status

        db.commit()
        db.refresh(db_appointment)

        # Load relationships before returning
        updated_appointment = (
            db.query(Appointment)
            .filter(Appointment.appointment_id == db_appointment.appointment_id)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .first()
        )

        return updated_appointment
    finally:
        db.close()

@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

        if appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")

        if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel appointment with status {appointment.status}"
            )

        appointment.status = AppointmentStatus.CANCELLED
        db.commit()
        db.refresh(appointment)

        canceled_appointment = (
            db.query(Appointment)
            .filter(Appointment.appointment_id == appointment.appointment_id)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .first()
        )

        return canceled_appointment
    finally:
        db.close()

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user=Depends(require_role(["Admin", "Receptionist"]))
):
    db = SessionLocal()
    try:
        appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

        if appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")

        db.delete(appointment)
        db.commit()

        return {"message": "Appointment deleted successfully"}
    finally:
        db.close()

@router.get("/doctor/{doctor_id}", response_model=list[AppointmentResponse])
def get_doctor_appointments(
    doctor_id: int,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.doctor_id == doctor_id)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .all()
        )
        return appointments
    finally:
        db.close()

@router.get("/patient/{patient_id}", response_model=list[AppointmentResponse])
def get_patient_appointments(
    patient_id: int,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient_id)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .all()
        )
        return appointments
    finally:
        db.close()

@router.get("/date/{appointment_date}", response_model=list[AppointmentResponse])
def get_appointments_by_date(
    appointment_date: date,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):
    db = SessionLocal()
    try:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.appointment_date == appointment_date)
            .options(joinedload(Appointment.doctor), joinedload(Appointment.patient))
            .all()
        )
        return appointments
    finally:
        db.close()