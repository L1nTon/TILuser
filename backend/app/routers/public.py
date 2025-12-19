from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.telegram import send_application_message

router = APIRouter(prefix="/public", tags=["public"])


def _locale_filter(query, model, locale: str | None):
    if locale:
        return query.filter(model.locale == locale)
    return query


@router.post("/applications", response_model=schemas.ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(payload: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    course_obj = None
    if payload.course_id:
        course_obj = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    elif payload.course:
        course_obj = db.query(models.Course).filter(models.Course.name == payload.course).first()

    application = models.Application(
        name=payload.name,
        phone=payload.phone,
        tg_username=payload.tg_username,
        course_id=course_obj.id if course_obj else None,
        course_title=course_obj.name if course_obj else payload.course,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    message_lines = [
        "Новая заявка",
        f"Имя: {application.name}",
        f"Телефон: {application.phone}",
        f"Telegram: {application.tg_username}",
        f"Курс: {application.course_title or 'Не указан'}",
    ]
    if course_obj:
        message_lines.extend(
            [
                f"Длительность: {course_obj.duration or '-'}",
                f"Уровень: {course_obj.level or '-'}",
                f"Язык: {course_obj.language or '-'}",
            ]
        )
    await send_application_message("\n".join(message_lines))

    return application


@router.get("/courses", response_model=List[schemas.CourseRead])
def list_courses(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Course).filter(models.Course.is_active.is_(True)).order_by(models.Course.created_at.desc())
    query = _locale_filter(query, models.Course, locale)
    return query.all()


@router.get("/courses/{slug}", response_model=schemas.CourseRead)
def get_course(slug: str, locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Course).filter(models.Course.slug == slug)
    query = _locale_filter(query, models.Course, locale)
    course = query.first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.get("/teachers", response_model=List[schemas.TeacherRead])
def list_teachers(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Teacher).order_by(models.Teacher.created_at.desc())
    query = _locale_filter(query, models.Teacher, locale)
    return query.all()


@router.get("/track", response_model=List[schemas.TrackStepRead])
def list_track(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.TrackStep).order_by(models.TrackStep.order.asc())
    query = _locale_filter(query, models.TrackStep, locale)
    return query.all()


@router.get("/reviews", response_model=List[schemas.ReviewRead])
def list_reviews(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Review).filter(models.Review.is_visible.is_(True)).order_by(models.Review.created_at.desc())
    query = _locale_filter(query, models.Review, locale)
    return query.all()


@router.get("/partners", response_model=List[schemas.PartnerRead])
def list_partners(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Partner).order_by(models.Partner.order.asc(), models.Partner.created_at.desc())
    query = _locale_filter(query, models.Partner, locale)
    return query.all()


@router.get("/blog", response_model=List[schemas.BlogPostRead])
def list_blog(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.BlogPost).filter(models.BlogPost.is_published.is_(True))
    nulls_last_order = case((models.BlogPost.published_at.is_(None), 1), else_=0)
    query = query.order_by(nulls_last_order, models.BlogPost.published_at.desc())
    query = _locale_filter(query, models.BlogPost, locale)
    return query.all()


@router.get("/blog/{slug}", response_model=schemas.BlogPostRead)
def get_blog_post(slug: str, locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.BlogPost).filter(models.BlogPost.slug == slug, models.BlogPost.is_published.is_(True))
    query = _locale_filter(query, models.BlogPost, locale)
    post = query.first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.get("/static/{slug}", response_model=schemas.StaticPageRead)
def get_static(slug: str, locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.StaticPage).filter(models.StaticPage.slug == slug)
    query = _locale_filter(query, models.StaticPage, locale)
    page = query.first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


@router.get("/contacts", response_model=schemas.ContactInfoRead)
def get_contacts(locale: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.ContactInfo).order_by(models.ContactInfo.id.asc())
    query = _locale_filter(query, models.ContactInfo, locale)
    contact = query.first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contacts not found")
    return contact

