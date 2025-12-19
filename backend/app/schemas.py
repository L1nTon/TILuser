from datetime import datetime
from enum import Enum
from typing import List, Optional
import re

from pydantic import BaseModel, Field, field_validator


class ApplicationStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CONTACTED = "contacted"
    ENROLLED = "enrolled"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class CourseBase(BaseModel):
    name: str
    language: str
    level: Optional[str] = None
    price: Optional[str] = None
    discount: Optional[str] = None
    duration: Optional[str] = None
    advantages: Optional[List[str]] = None
    is_active: bool = True
    slug: str
    description: Optional[str] = None
    locale: str = "ru"


class CourseCreate(CourseBase):
    pass


class CourseRead(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=7, max_length=50)
    tg_username: str = Field(..., min_length=2, max_length=100)
    course: str | None = None
    course_id: int | None = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Удаляем пробелы и дефисы
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        # Проверяем что остались только цифры и опционально +
        if not re.match(r'^\+?\d{7,15}$', cleaned):
            raise ValueError('Неверный формат телефона. Используйте формат: +998901234567')
        return v

    @field_validator('tg_username')
    @classmethod
    def validate_telegram(cls, v: str) -> str:
        # Убираем @ если есть
        cleaned = v.lstrip('@')
        if not re.match(r'^[a-zA-Z0-9_]{2,32}$', cleaned):
            raise ValueError('Неверный формат Telegram username')
        return v if v.startswith('@') else f'@{cleaned}'


class ApplicationRead(BaseModel):
    id: int
    name: str
    phone: str
    tg_username: str
    status: str
    course_id: int | None
    course_title: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    login: str
    password: str


# Teachers
class TeacherBase(BaseModel):
    name: str
    bio: Optional[str] = None
    photo_base64: Optional[str] = None
    socials: Optional[List[str] | dict] = None
    locale: str = "ru"


class TeacherCreate(TeacherBase):
    pass


class TeacherRead(TeacherBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Track steps
class TrackStepBase(BaseModel):
    title: str
    body: Optional[str] = None
    order: int = 0
    course_links: Optional[List[str] | dict] = None
    locale: str = "ru"


class TrackStepCreate(TrackStepBase):
    pass


class TrackStepRead(TrackStepBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Reviews
class ReviewBase(BaseModel):
    name: str
    role: Optional[str] = None
    quote: str
    is_visible: bool = True
    locale: str = "ru"


class ReviewCreate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Partners
class PartnerBase(BaseModel):
    name: str
    url: Optional[str] = None
    logo_base64: Optional[str] = None
    locale: str = "ru"
    order: int = 0


class PartnerCreate(PartnerBase):
    pass


class PartnerRead(PartnerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Blog
class BlogPostBase(BaseModel):
    title: str
    slug: str
    body: str
    excerpt: Optional[str] = None
    cover_base64: Optional[str] = None
    locale: str = "ru"
    is_published: bool = False
    published_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostRead(BlogPostBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Static pages
class StaticPageBase(BaseModel):
    slug: str
    locale: str = "ru"
    body: Optional[dict] = None


class StaticPageCreate(StaticPageBase):
    pass


class StaticPageRead(StaticPageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Contacts
class ContactInfoBase(BaseModel):
    locale: str = "ru"
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    socials: Optional[dict] = None
    map_embed: Optional[str] = None


class ContactInfoCreate(ContactInfoBase):
    pass


class ContactInfoRead(ContactInfoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



