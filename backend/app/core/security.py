from datetime import datetime, timedelta

from jose import jwt
from passlib.hash import bcrypt
from passlib.exc import UnknownHashError

# JWT Configuration
SECRET_KEY = "this_is_my_super_secret_key_12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Hash Password
def hash_password(password: str):
    return bcrypt.hash(password)


# Verify Password
def verify_password(plain_password: str, hashed_password: str):
    if not isinstance(hashed_password, str):
        return False

    try:
        return bcrypt.verify(plain_password, hashed_password)
    except (UnknownHashError, ValueError):
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