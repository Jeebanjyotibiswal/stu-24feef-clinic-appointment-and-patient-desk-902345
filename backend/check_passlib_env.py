import sys
import pkgutil
print('sys.executable=', sys.executable)
print('sys.version=', sys.version)
print('bcrypt module available=', any(m.name == 'bcrypt' for m in pkgutil.iter_modules()))
try:
    import bcrypt
    print('bcrypt version=', bcrypt.__version__)
except Exception as exc:
    print('bcrypt import failed:', type(exc).__name__, exc)
from passlib.context import CryptContext
ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
print('ctx schemes=', ctx.schemes())
for hash_string in [
    '$2b$12$.iYXy7RVeaa7L5tzH61ifel2GmejrhSwmFo89zL2S/V9xUTxkm7xq',
    '$2b$12$mZj.uMh2NdA/2vga2CuO6.LfcRBEbxd/P2LpprjIVJqbwWnKhI.M6'
]:
    try:
        print('identify', hash_string, '->', ctx.identify(hash_string))
    except Exception as exc:
        print('identify failed', exc)
