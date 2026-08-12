from datetime import datetime
from os import getenv
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from .models import Booking, BookingStatus, LSA, Parent, Payment, PaymentStatus
from .schemas import BookingCreate, BookingRead, LSARead, PaymentWebhook

DATABASE_URL = getenv("SUPABASE_DB_URL", "sqlite:///./habohub.db")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
app = FastAPI(title="HaboConnect API", version="1.0.0")


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/lsas/search", response_model=list[LSARead])
def search_lsas(
    skill: str | None = Query(default=None),
    starts_at: datetime | None = Query(default=None),
    ends_at: datetime | None = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(LSA).where(LSA.active.is_(True))
    if skill:
        query = query.where(LSA.skills.any(skill))
    if starts_at and ends_at:
        blocked = select(Booking.lsa_id).where(
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
            Booking.starts_at < ends_at,
            Booking.ends_at > starts_at,
        )
        query = query.where(~LSA.id.in_(blocked))
    return session.scalars(query.order_by(LSA.name)).all()


@app.post("/api/v1/bookings", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, session: Session = Depends(get_session)):
    lsa = session.get(LSA, payload.lsa_id)
    if not lsa or not lsa.active:
        raise HTTPException(status_code=404, detail="LSA not found")

    parent = session.scalar(select(Parent).where(Parent.email == payload.parent_email))
    if not parent:
        parent = Parent(name=payload.parent_name, email=payload.parent_email, phone=payload.parent_phone)
        session.add(parent)
        session.flush()

    booking = Booking(
        parent_id=parent.id,
        lsa_id=lsa.id,
        child_name=payload.child_name,
        skill=payload.skill,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        notes=payload.notes,
    )
    session.add(booking)
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise HTTPException(status_code=409, detail="This LSA is already booked for that time") from error
    session.refresh(booking)
    return booking


@app.post("/api/v1/payments/webhook")
def payment_webhook(payload: PaymentWebhook, session: Session = Depends(get_session)):
    booking = session.get(Booking, payload.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if session.scalar(select(Payment).where(Payment.provider_event_id == payload.event_id)):
        return {"received": True, "duplicate": True}

    succeeded = payload.status.lower() in {"succeeded", "paid", "success"}
    payment = Payment(
        booking_id=booking.id,
        provider_event_id=payload.event_id,
        amount=payload.amount,
        status="succeeded" if succeeded else "failed",
    )
    booking.payment_status = PaymentStatus.PAID if succeeded else PaymentStatus.FAILED
    booking.status = BookingStatus.CONFIRMED if succeeded else BookingStatus.PENDING
    session.add(payment)
    session.commit()
    return {"received": True, "booking_status": booking.status}
