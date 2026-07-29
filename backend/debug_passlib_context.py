from app.core.security import pwd_context
from passlib.hash import bcrypt

hash_string = '$2b$12$.iYXy7RVeaa7L5tzH61ifel2GmejrhSwmFo89zL2S/V9xUTxkm7xq'

print('pwd_context:', pwd_context)
print('pwd_context schemes:', pwd_context.schemes())
print('handler_map keys:', list(pwd_context.handler_map.keys()))
print('handler_map[bcrypt]:', pwd_context.handler_map.get('bcrypt'))
print('pwd_context identify:', pwd_context.identify(hash_string))
print('bcrypt.identify:', bcrypt.identify(hash_string))
try:
    print('bcrypt.verify:', bcrypt.verify('test', hash_string))
except Exception as e:
    print('bcrypt.verify exception:', type(e).__name__, e)
try:
    print('pwd_context.verify:', pwd_context.verify('test', hash_string))
except Exception as e:
    print('pwd_context.verify exception:', type(e).__name__, e)
