from fastapi import APIRouter, Depends
from fastapi import HTTPException
from app.database import SessionLocal
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.dependencies.roles import require_role
from app.schemas.doctor import DoctorCreate, DoctorUpdate

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


@router.post(
    "/",
    response_model=DoctorResponse
)
def create_doctor(
    doctor: DoctorCreate,
    current_user=Depends(require_role(["Admin", "Receptionist", "Doctor"]))
):

    db = SessionLocal()

    doctor_data = {
        "name": doctor.name,
        "gender": doctor.gender,
        "specialization": doctor.specialization,
        "department": doctor.department,
        "join_date": doctor.join_date,
        "experience": doctor.experience,
    }

    if doctor.doctor_id is not None:
        doctor_data["doctor_id"] = doctor.doctor_id

    new_doctor = Doctor(**doctor_data)

    try:
        db.add(new_doctor)
        db.commit()
        db.refresh(new_doctor)
    except Exception as e:
        db.rollback()
        db.close()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create doctor: {str(e)}"
        )

    db.close()
    return new_doctor


@router.get("/")
def get_all_doctors(
    current_user=Depends(
        require_role(["Admin", "Receptionist", "Doctor"])
    )
):
    db = SessionLocal()

    doctors = db.query(Doctor).all()

    db.close()

    return doctors

@router.get("/{doctor_id}")
def get_doctor_by_id(
    doctor_id: int,
    current_user=Depends(
        require_role(["Admin", "Doctor", "Receptionist"])
    )
):
    db = SessionLocal()

    doctor = db.query(Doctor).filter(
        Doctor.doctor_id == doctor_id
    ).first()

    db.close()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return doctor

from fastapi import HTTPException

@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    current_user=Depends(require_role(["Admin"]))
):
    db = SessionLocal()

    db_doctor = db.query(Doctor).filter(
        Doctor.doctor_id == doctor_id
    ).first()

    if db_doctor is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    db_doctor.name = doctor.name
    db_doctor.gender = doctor.gender
    db_doctor.specialization = doctor.specialization
    db_doctor.department = doctor.department
    db_doctor.join_date = doctor.join_date
    db_doctor.experience = doctor.experience

    db.commit()
    db.refresh(db_doctor)
    db.close()

    return db_doctor

from fastapi import HTTPException

@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: str,
    current_user=Depends(require_role(["Admin"]))
):
    db = SessionLocal()

    doctor = db.query(Doctor).filter(
        Doctor.doctor_id == doctor_id
    ).first()

    if doctor is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    db.delete(doctor)
    db.commit()
    db.close()

    return {
        "message": "Doctor deleted successfully"
    }