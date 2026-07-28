from app.schemas.doctor import DoctorCreate


def test_doctor_create_accepts_numeric_doctor_id_and_coerces_to_string():
    payload = {
        "doctor_id": 101,
        "name": "Dr. Smith",
        "gender": "Male",
        "specialization": "Cardiology",
        "department": "General Medicine",
        "join_date": "2024-01-10",
        "experience": 5,
    }

    doctor = DoctorCreate(**payload)

    assert doctor.doctor_id == "101"
