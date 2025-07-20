# import jwt
# import os
# from datetime import datetime, timedelta

# JWT_SECRET = os.getenv("JWT_SECRET_KEY")
# JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")
# JWT_EXP_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 30))

# def create_jwt(account_number: str):
#     payload = {
#         "sub": account_number,
#         "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES),
#         "iat": datetime.utcnow()
#     }
#     token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
#     return token
import jwt
import os
from datetime import datetime, timedelta

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 30))

def create_jwt(account_number: str):
    payload = {
        "sub": account_number,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return token
