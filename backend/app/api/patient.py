from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.database import SessionLocal
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse
from app.dependencies.roles import require_role
from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
    PatientUpdate
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate,
    current_user=Depends(require_role(["Admin", "Receptionist"]))
):
    db = SessionLocal()

    new_patient = Patient(
        full_name=patient.full_name,
        gender=patient.gender,
        dob=patient.dob,
        phone=patient.phone,
        email=patient.email,
        address=patient.address,
        blood_group=patient.blood_group
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    db.close()

    return new_patient

@router.get("/", response_model=list[PatientResponse])
def get_all_patients(
    current_user=Depends(
        require_role(["Admin", "Doctor", "Receptionist"])
    )
):
    db = SessionLocal()

    patients = db.query(Patient).all()

    db.close()

    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(
    patient_id: int,
    current_user=Depends(
        require_role(["Admin", "Doctor", "Receptionist"])
    )
):
    db = SessionLocal()

    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    db.close()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    current_user=Depends(
        require_role(["Admin", "Receptionist"])
    )
):
    db = SessionLocal()

    db_patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    if db_patient is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db_patient.full_name = patient.full_name
    db_patient.gender = patient.gender
    db_patient.dob = patient.dob
    db_patient.phone = patient.phone
    db_patient.email = patient.email
    db_patient.address = patient.address
    db_patient.blood_group = patient.blood_group

    db.commit()
    db.refresh(db_patient)
    db.close()

    return db_patient


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    current_user=Depends(
        require_role(["Admin"])
    )
):
    db = SessionLocal()

    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    if patient is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db.delete(patient)
    db.commit()
    db.close()

    return {
        "message": "Patient deleted successfully"
    }