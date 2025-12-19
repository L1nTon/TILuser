from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])
LOCALES = {"ru", "uz", "en", "ja"}


def _base_slug(slug: str) -> str:
    if not slug:
        return slug
    parts = slug.split("-")
    if parts[-1] in LOCALES:
        return "-".join(parts[:-1]) or slug
    return slug


@router.get("/courses", response_model=List[schemas.CourseRead])
def list_courses_admin(db: Session = Depends(get_db)):
    return db.query(models.Course).order_by(models.Course.created_at.desc()).all()


@router.post("/courses", response_model=schemas.CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    if db.query(models.Course).filter(models.Course.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    course = models.Course(**payload.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/courses/{course_id}", response_model=schemas.CourseRead)
def update_course(course_id: int, payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    base = _base_slug(course.slug)
    for key, value in payload.dict().items():
        setattr(course, key, value)
    # синхронизируем статус активности по всем локалям этого курса
    # Экранируем спецсимволы для LIKE
    escaped_base = base.replace('%', r'\%').replace('_', r'\_')
    db.query(models.Course).filter(
        (models.Course.slug == base) | models.Course.slug.like(f"{escaped_base}-%", escape='\\')
    ).update({models.Course.is_active: payload.is_active}, synchronize_session=False)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    base = _base_slug(course.slug)
    # Экранируем спецсимволы для LIKE
    escaped_base = base.replace('%', r'\%').replace('_', r'\_')
    db.query(models.Course).filter(
        (models.Course.slug == base) | models.Course.slug.like(f"{escaped_base}-%", escape='\\')
    ).delete(synchronize_session=False)
    db.commit()
    return None


@router.get("/applications", response_model=List[schemas.ApplicationRead])
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Application).order_by(models.Application.created_at.desc())
    if status_filter:
        query = query.filter(models.Application.status == status_filter)
    return query.all()


@router.patch("/applications/{application_id}", response_model=schemas.ApplicationRead)
def update_application_status(
    application_id: int,
    payload: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db)
):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    application.status = payload.status.value
    db.commit()
    db.refresh(application)
    return application


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    db.delete(application)
    db.commit()
    return None


# Teachers
@router.get("/teachers", response_model=List[schemas.TeacherRead])
def list_teachers_admin(db: Session = Depends(get_db)):
    return db.query(models.Teacher).order_by(models.Teacher.created_at.desc()).all()


@router.post("/teachers", response_model=schemas.TeacherRead, status_code=status.HTTP_201_CREATED)
def create_teacher(payload: schemas.TeacherCreate, db: Session = Depends(get_db)):
    teacher = models.Teacher(**payload.dict())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.put("/teachers/{teacher_id}", response_model=schemas.TeacherRead)
def update_teacher(teacher_id: int, payload: schemas.TeacherCreate, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    for k, v in payload.dict().items():
        setattr(teacher, k, v)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    db.delete(teacher)
    db.commit()
    return None


# Track steps
@router.get("/track", response_model=List[schemas.TrackStepRead])
def list_track_admin(db: Session = Depends(get_db)):
    return db.query(models.TrackStep).order_by(models.TrackStep.order.asc()).all()


@router.post("/track", response_model=schemas.TrackStepRead, status_code=status.HTTP_201_CREATED)
def create_track_step(payload: schemas.TrackStepCreate, db: Session = Depends(get_db)):
    step = models.TrackStep(**payload.dict())
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


@router.put("/track/{step_id}", response_model=schemas.TrackStepRead)
def update_track_step(step_id: int, payload: schemas.TrackStepCreate, db: Session = Depends(get_db)):
    step = db.query(models.TrackStep).filter(models.TrackStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track step not found")
    for k, v in payload.dict().items():
        setattr(step, k, v)
    db.commit()
    db.refresh(step)
    return step


@router.delete("/track/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track_step(step_id: int, db: Session = Depends(get_db)):
    step = db.query(models.TrackStep).filter(models.TrackStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track step not found")
    db.delete(step)
    db.commit()
    return None


# Reviews
@router.get("/reviews", response_model=List[schemas.ReviewRead])
def list_reviews_admin(db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.created_at.desc()).all()


@router.post("/reviews", response_model=schemas.ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    review = models.Review(**payload.dict())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/reviews/{review_id}", response_model=schemas.ReviewRead)
def update_review(review_id: int, payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    for k, v in payload.dict().items():
        setattr(review, k, v)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()
    return None


# Partners
@router.get("/partners", response_model=List[schemas.PartnerRead])
def list_partners_admin(db: Session = Depends(get_db)):
    return db.query(models.Partner).order_by(models.Partner.order.asc(), models.Partner.created_at.desc()).all()


@router.post("/partners", response_model=schemas.PartnerRead, status_code=status.HTTP_201_CREATED)
def create_partner(payload: schemas.PartnerCreate, db: Session = Depends(get_db)):
    partner = models.Partner(**payload.dict())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/partners/{partner_id}", response_model=schemas.PartnerRead)
def update_partner(partner_id: int, payload: schemas.PartnerCreate, db: Session = Depends(get_db)):
    partner = db.query(models.Partner).filter(models.Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    for k, v in payload.dict().items():
        setattr(partner, k, v)
    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partner(partner_id: int, db: Session = Depends(get_db)):
    partner = db.query(models.Partner).filter(models.Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    db.delete(partner)
    db.commit()
    return None


# Blog
@router.get("/blog", response_model=List[schemas.BlogPostRead])
def list_blog_admin(db: Session = Depends(get_db)):
    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).all()


@router.post("/blog", response_model=schemas.BlogPostRead, status_code=status.HTTP_201_CREATED)
def create_blog_post(payload: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    if db.query(models.BlogPost).filter(models.BlogPost.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    post = models.BlogPost(**payload.dict())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/blog/{post_id}", response_model=schemas.BlogPostRead)
def update_blog_post(post_id: int, payload: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if payload.slug != post.slug:
        if db.query(models.BlogPost).filter(models.BlogPost.slug == payload.slug).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    for k, v in payload.dict().items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/blog/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    db.delete(post)
    db.commit()
    return None


# Static pages
@router.get("/static", response_model=List[schemas.StaticPageRead])
def list_static_pages(db: Session = Depends(get_db)):
    return db.query(models.StaticPage).order_by(models.StaticPage.slug.asc(), models.StaticPage.locale.asc()).all()


@router.post("/static", response_model=schemas.StaticPageRead, status_code=status.HTTP_201_CREATED)
def create_static_page(payload: schemas.StaticPageCreate, db: Session = Depends(get_db)):
    page = models.StaticPage(**payload.dict())
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.put("/static/{page_id}", response_model=schemas.StaticPageRead)
def update_static_page(page_id: int, payload: schemas.StaticPageCreate, db: Session = Depends(get_db)):
    page = db.query(models.StaticPage).filter(models.StaticPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    for k, v in payload.dict().items():
        setattr(page, k, v)
    db.commit()
    db.refresh(page)
    return page


@router.delete("/static/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_static_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(models.StaticPage).filter(models.StaticPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    db.delete(page)
    db.commit()
    return None


# Contacts (single per locale)
@router.get("/contacts", response_model=List[schemas.ContactInfoRead])
def list_contacts_admin(db: Session = Depends(get_db)):
    return db.query(models.ContactInfo).order_by(models.ContactInfo.locale.asc()).all()


@router.post("/contacts", response_model=schemas.ContactInfoRead, status_code=status.HTTP_201_CREATED)
def create_contact(payload: schemas.ContactInfoCreate, db: Session = Depends(get_db)):
    contact = models.ContactInfo(**payload.dict())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.put("/contacts/{contact_id}", response_model=schemas.ContactInfoRead)
def update_contact(contact_id: int, payload: schemas.ContactInfoCreate, db: Session = Depends(get_db)):
    contact = db.query(models.ContactInfo).filter(models.ContactInfo.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    for k, v in payload.dict().items():
        setattr(contact, k, v)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(models.ContactInfo).filter(models.ContactInfo.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return None

