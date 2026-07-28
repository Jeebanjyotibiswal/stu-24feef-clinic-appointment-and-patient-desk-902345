from datetime import date
from pydantic import BaseModel


class PatientCreate(BaseModel):
    full_name: str
    gender: str
    dob: date
    phone: str
    email: str | None = None
    address: str | None = None
    blood_group: str | None = None

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        schema = super().__get_pydantic_core_schema__(source_type, handler)
        return schema


class PatientResponse(BaseModel):
    patient_id: int
    full_name: str
    gender: str
    dob: date
    phone: str
    email: str | None = None
    address: str | None = None
    blood_group: str | None = None

    class Config:
        from_attributes = True


class PatientUpdate(BaseModel):
    full_name: str
    gender: str
    dob: date
    phone: str
    email: str | None = None
    address: str | None = None
    blood_group: str | None = None

class PatientBasicResponse(BaseModel):
    patient_id: int
    full_name: str

    model_config = {
        "from_attributes": True
    }