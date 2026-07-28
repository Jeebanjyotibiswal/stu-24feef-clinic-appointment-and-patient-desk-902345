from datetime import date

from pydantic import BaseModel, field_validator


class DoctorCreate(BaseModel):
    doctor_id: str | int | None = None
    name: str
    gender: str
    specialization: str
    department: str
    join_date: date
    experience: int

    @field_validator("doctor_id", mode="before")
    @classmethod
    def validate_doctor_id(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            return value.strip()
        if isinstance(value, int):
            return str(value)
        return str(value)


class DoctorResponse(BaseModel):
    doctor_id: str | int | None = None
    name: str
    gender: str
    specialization: str
    department: str
    join_date: date
    experience: int

    class Config:
        from_attributes = True


class DoctorBasicResponse(BaseModel):
    doctor_id: int | str
    name: str

    model_config = {
        "from_attributes": True
    }


class DoctorUpdate(BaseModel):
    name: str
    gender: str
    specialization: str
    department: str
    join_date: date
    experience: int