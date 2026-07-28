from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String


# Base class for all database tables
class Base(DeclarativeBase):
    pass


# Admin table
class Admin(Base):

    # Table name inside PostgreSQL
    __tablename__ = "admins"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Username
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    # Password
    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )