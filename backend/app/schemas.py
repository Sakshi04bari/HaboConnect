from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class BookingCreate(BaseModel):
    parent_name: str = Field(min_length=2, max_length=160)
    parent_email: EmailStr
    parent_phone: str | None = Field(default=None, max_length=40)
    child_name: str = Field(min_length=2, max_length=160)
    lsa_id: UUID
    skill: str = Field(min_length=2, max_length=120)
    starts_at: datetime
    ends_at: datetime
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("ends_at")
    @classmethod
    def end_after_start(cls, value: datetime, info):
        starts_at = info.data.get("starts_at")
        if starts_at and value <= starts_at:
            raise ValueError("ends_at must be after starts_at")
        return value


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    child_name: str
    skill: str
    starts_at: datetime
    ends_at: datetime
    status: str
    payment_status: str
    lsa_id: UUID


class LSARead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    skills: list[str]
    hourly_rate: Decimal
    timezone: str
    active: bool


class PaymentWebhook(BaseModel):
    event_id: str = Field(min_length=1, max_length=255)
    booking_id: UUID
    status: str
    amount: Decimal = Field(gt=0)
