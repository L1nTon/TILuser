from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings
from .security import decode_token

bearer_scheme = HTTPBearer()
settings = get_settings()


def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> str:
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("sub") != settings.admin_login:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized")
    return payload["sub"]



