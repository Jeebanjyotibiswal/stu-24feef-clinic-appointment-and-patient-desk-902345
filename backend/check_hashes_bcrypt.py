from pathlib import Path
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from passlib.hash import bcrypt

load_dotenv(dotenv_path=Path('.') / '.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('DATABASE_URL is not set')

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    rows = conn.execute(text('SELECT user_id, username, password_hash FROM users')).fetchall()
    print('total', len(rows))
    bad = []
    for user_id, username, password_hash in rows:
        if not isinstance(password_hash, str):
            bad.append((user_id, username, 'not-str', repr(password_hash)))
            continue
        if not password_hash.startswith('$2'):
            bad.append((user_id, username, 'no-hash-prefix', repr(password_hash)))
            continue
        try:
            ident = bcrypt.identify(password_hash)
            # if bcrypt.identify returns None, it's invalid
            if ident is None:
                bad.append((user_id, username, 'identify-none', repr(password_hash)))
                continue
        except Exception as exc:
            bad.append((user_id, username, 'identify-ex', repr(password_hash), type(exc).__name__, str(exc)))
            continue
        try:
            bcrypt.verify('password', password_hash)
        except Exception as exc:
            bad.append((user_id, username, 'verify-ex', repr(password_hash), type(exc).__name__, str(exc)))
    print('bad count', len(bad))
    for item in bad:
        print(item)
