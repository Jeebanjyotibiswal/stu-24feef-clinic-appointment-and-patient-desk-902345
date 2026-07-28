from pydantic import BaseModel


class LoginRequest(BaseModel):
    """
    Data received from the login form.
    """

    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    email: str
    phone: str