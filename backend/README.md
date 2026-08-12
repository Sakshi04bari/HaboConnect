# HaboConnect Python Backend

A production-shaped FastAPI prototype for matching parents with Learning Support Assistants (LSAs).

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set `SUPABASE_DB_URL` to the hosted Postgres connection string for production. The local fallback uses SQLite for a quick smoke test.

## API

- `GET /health` — liveness check.
- `GET /api/v1/lsas/search?skill=...&starts_at=...&ends_at=...` — filters active LSAs and excludes overlapping pending or confirmed bookings in one query.
- `POST /api/v1/bookings` — validates parent, child, LSA, skill, and time range, then stores a booking. Database exclusion constraints are the final double-booking guard.
- `POST /api/v1/payments/webhook` — idempotently records a gateway event and transitions booking/payment state.

## Design choices

The domain is split into Parent, LSA, Booking, and Payment entities. Availability is resolved by a single filtered query plus an overlap predicate, avoiding an N+1 loop. Booking creation relies on both application validation and the database range exclusion constraint so concurrent requests cannot double-book the same LSA.

The payment webhook is replay-safe through a unique provider event ID. The event is stored before the booking status is transitioned, so retries return a successful duplicate response without creating a second payment record.

## Test

```bash
pytest
```
