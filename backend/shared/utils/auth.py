from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Dict
from app.config import settings


def generate_tokens(payload: Dict):

    access_payload = payload.copy()
    access_payload["type"] = "access"
    access_payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE)

    access_token = jwt.encode(
        access_payload,
        settings.JWT_SECRET,
        algorithm="HS256"
    )

    refresh_payload = payload.copy()
    refresh_payload["type"] = "refresh"
    refresh_payload["exp"] = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE)

    refresh_token = jwt.encode(
        refresh_payload,
        settings.JWT_REFRESH_SECRET,
        algorithm="HS256"
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }


def verify_token(token: str, token_type: str = "access"):

    secret = settings.JWT_SECRET if token_type == "access" else settings.JWT_REFRESH_SECRET

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])

        if payload.get("type") != token_type:
            raise Exception("Invalid token type")

        return payload

    except JWTError as e:
        raise Exception(f"Invalid {token_type} token: {str(e)}")


def extract_token_from_header(auth_header: str):

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    return auth_header[7:]