from datetime import datetime, timedelta

from jose import jwt
import bcrypt
from passlib.exc import UnknownHashError

# JWT Configuration
SECRET_KEY = "this_is_my_super_secret_key_12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Hash Password
def hash_password(password: str):
    if not isinstance(password, str):
        raise TypeError("Password must be a string")

    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password cannot be longer than 72 bytes for bcrypt")

    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


# Verify Password
def verify_password(plain_password: str, hashed_password: str):
    if not isinstance(hashed_password, str):
        return False

    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError, bcrypt.error):
        return False


# Create JWT Token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt