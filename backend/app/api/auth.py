from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from app.database import SessionLocal
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token
)
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    db = SessionLocal()

    db_user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    db.close()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={
            "sub": db_user.username,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role
    }


@router.post("/register")
def register(user: RegisterRequest):
    db = SessionLocal()

    new_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        full_name=user.full_name,
        role=user.role,
        email=user.email,
        phone=user.phone
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists",
        )
    finally:
        db.close()

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.user_id
    }