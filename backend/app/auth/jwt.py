from jose import jwt, JWTError
from app.config import JWT_SECRET, JWT_ALGORITHM

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
