import app.models
import app.models.appointment
import app.models.doctor
import app.models.patient
from app.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, pwd_context

session = SessionLocal()
user = session.query(User).filter(User.username == 'jeeban').first()
print('user', user)
print('password_hash repr', repr(user.password_hash))
print('type', type(user.password_hash))
print('starts with', user.password_hash[:4])
print('len', len(user.password_hash))
print('identify', pwd_context.identify(user.password_hash))
try:
    print('verify password', verify_password('password', user.password_hash))
except Exception as exc:
    print('verify exception', type(exc).__name__, exc)
session.close()
