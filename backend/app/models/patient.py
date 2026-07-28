from datetime import date

from sqlalchemy import Integer, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Patient(Base):

    __tablename__ = "patients"

    patient_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    gender: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    dob: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    phone: Mapped[str] = mapped_column(
        String(15),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    blood_group: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )
    appointments = relationship(
        "Appointment",
        back_populates="patient"
    )