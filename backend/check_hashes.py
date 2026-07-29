from pathlib import Path
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

load_dotenv(dotenv_path=Path('.') / '.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('DATABASE_URL is not set')

engine = create_engine(DATABASE_URL)
ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')

with engine.connect() as conn:
    rows = conn.execute(text('SELECT user_id, username, password_hash FROM users')).fetchall()
    bad = []
    for user_id, username, password_hash in rows:
        if password_hash is None or not isinstance(password_hash, str):
            bad.append((user_id, username, 'not-str', repr(password_hash)))
            continue
        try:
            ident = ctx.identify(password_hash)
        except Exception as e:
            bad.append((user_id, username, 'identify-ex', repr(password_hash), str(e)))
            continue
        if ident != 'bcrypt':
            bad.append((user_id, username, 'not-bcrypt', ident, repr(password_hash)))
    print('total', len(rows))
    print('bad', len(bad))
    for item in bad[:100]:
        print(item)
