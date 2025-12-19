from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..config import get_settings
from ..database import get_db
from .. import models
from ..schemas import LoginRequest, Token
from ..security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Сначала пробуем найти в БД
    admin = db.query(models.Admin).filter(models.Admin.username == payload.login).first()

    if admin and admin.is_active:
        # Проверяем хешированный пароль
        if pwd_context.verify(payload.password, admin.hashed_password):
            token = create_access_token({"sub": admin.username})
            return {"access_token": token, "token_type": "bearer"}

    # Fallback на env переменные для обратной совместимости
    if payload.login == settings.admin_login and payload.password == settings.admin_password:
        token = create_access_token({"sub": settings.admin_login})
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")



