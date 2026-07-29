from passlib.hash import bcrypt

h = '$2b$12$.iYXy7RVeaa7L5tzH61ifel2GmejrhSwmFo89zL2S/V9xUTxkm7xq'
print('identify', bcrypt.identify(h))
try:
    print('verify password', bcrypt.verify('password', h))
except Exception as exc:
    print('verify exception', type(exc).__name__, exc)
