from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_booking_payload_rejects_invalid_time():
    starts_at = datetime.now(timezone.utc)
    response = client.post("/api/v1/bookings", json={
        "parent_name": "Amina Doe",
        "parent_email": "amina@example.com",
        "child_name": "Sam Doe",
        "lsa_id": "00000000-0000-0000-0000-000000000001",
        "skill": "Dyslexia support",
        "starts_at": starts_at.isoformat(),
        "ends_at": (starts_at - timedelta(minutes=30)).isoformat(),
    })
    assert response.status_code == 422
