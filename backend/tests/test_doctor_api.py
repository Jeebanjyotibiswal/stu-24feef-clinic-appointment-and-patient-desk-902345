import random
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture
def auth_headers():
    token = create_access_token({"sub": "admin_user", "role": "Admin"})
    return {"Authorization": f"Bearer {token}"}

def test_create_doctor_with_custom_id(auth_headers):
    unique_id = random.randint(10000, 99999)
    payload = {
        "doctor_id": unique_id,
        "name": "Dr. John Doe",
        "gender": "Male",
        "specialization": "Cardiology",
        "department": "Cardiology Dept",
        "join_date": "2024-01-15",
        "experience": 10
    }
    response = client.post("/doctors/", json=payload, headers=auth_headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["doctor_id"] == unique_id
    assert data["name"] == "Dr. John Doe"

def test_create_doctor_without_id(auth_headers):
    payload = {
        "name": "Dr. Jane Smith",
        "gender": "Female",
        "specialization": "Neurology",
        "department": "Neurology Dept",
        "join_date": "2024-02-01",
        "experience": 7
    }
    response = client.post("/doctors/", json=payload, headers=auth_headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "doctor_id" in data
    assert isinstance(data["doctor_id"], int)
    assert data["name"] == "Dr. Jane Smith"
