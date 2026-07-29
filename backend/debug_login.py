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
print('verify test', verify_password('dummy', user.password_hash))
session.close()
