import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import pytest
from fastapi.testclient import TestClient


db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_vitality.db"))
if os.path.exists(db_path):
    os.remove(db_path)
os.environ.setdefault("DATABASE_URL", "sqlite:///" + db_path)

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_registration_and_login(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Aisha",
            "email": "aisha@example.com",
            "password": "Secret123",
            "confirm_password": "Secret123",
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["user"]["email"] == "aisha@example.com"
    assert "access_token" in body

    login = client.post(
        "/api/auth/login",
        json={"email": "aisha@example.com", "password": "Secret123"},
    )
    assert login.status_code == 200, login.text
    assert "access_token" in login.json()


def test_forgot_password_flow(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Reset User",
            "email": "reset@example.com",
            "password": "Secret123",
            "confirm_password": "Secret123",
        },
    )

    forgot = client.post(
        "/api/auth/forgot-password",
        json={"email": "reset@example.com"},
    )
    assert forgot.status_code == 200, forgot.text
    reset_token = forgot.json()["reset_token"]

    reset = client.post(
        "/api/auth/reset-password",
        json={
            "token": reset_token,
            "new_password": "NewPass456",
            "confirm_password": "NewPass456",
        },
    )
    assert reset.status_code == 200, reset.text

    old_login = client.post(
        "/api/auth/login",
        json={"email": "reset@example.com", "password": "Secret123"},
    )
    assert old_login.status_code == 401, old_login.text

    new_login = client.post(
        "/api/auth/login",
        json={"email": "reset@example.com", "password": "NewPass456"},
    )
    assert new_login.status_code == 200, new_login.text
    assert "access_token" in new_login.json()


def test_profile_and_goals_flow(client):
    token = client.post(
        "/api/auth/login",
        json={"email": "aisha@example.com", "password": "Secret123"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    profile = client.post(
        "/api/profile",
        json={"age": 21, "height_cm": 165, "weight_kg": 58, "activity_level": "Moderate", "sleep_duration_hours": 7.5, "water_intake_liters": 2.2, "goal": "Improve Daily Routine"},
        headers=headers,
    )
    assert profile.status_code == 200, profile.text
    assert profile.json()["age"] == 21

    goals = client.get("/api/goals/today", headers=headers)
    assert goals.status_code == 200, goals.text
    data = goals.json()
    assert len(data) >= 1

    goal_id = data[0]["id"]
    toggle = client.put(f"/api/goals/{goal_id}", json={"completed": True}, headers=headers)
    assert toggle.status_code == 200, toggle.text
    assert toggle.json()["completed"] is True

    progress = client.get("/api/goals/progress", headers=headers)
    assert progress.status_code == 200, progress.text
    assert progress.json()["total"] >= 1


def test_water_sleep_and_mood_persistence(client):
    token = client.post(
        "/api/auth/login",
        json={"email": "aisha@example.com", "password": "Secret123"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    water = client.post("/api/water", json={"amount_ml": 350}, headers=headers)
    assert water.status_code == 200, water.text
    today = client.get("/api/water/today", headers=headers)
    assert today.status_code == 200, today.text
    assert today.json()["total_ml"] >= 350

    sleep = client.post(
        "/api/sleep",
        json={
            "bedtime": "2026-10-13T22:30:00",
            "wake_time": "2026-10-14T06:30:00",
            "quality": "Good",
        },
        headers=headers,
    )
    assert sleep.status_code == 200, sleep.text
    assert sleep.json()["duration_minutes"] > 200

    mood = client.post("/api/mood", json={"mood": "Good", "note": "Feeling positive"}, headers=headers)
    assert mood.status_code == 200, mood.text

    history = client.get("/api/mood/history", headers=headers)
    assert history.status_code == 200, history.text
    assert len(history.json()) >= 1


def test_survey_and_resources(client):
    survey = client.post(
        "/api/survey",
        json={
            "age_group": "18-24",
            "activity_level": "Moderate",
            "sleep_range": "6-7 hours",
            "water_range": "2-3L",
            "exercise_frequency": "3-4 times/week",
            "food_habits": "Mostly balanced",
            "mood": "Good",
        },
    )
    assert survey.status_code == 200, survey.text

    public_survey = client.get("/api/survey")
    assert public_survey.status_code == 200, public_survey.text
    assert public_survey.json()["total_responses"] >= 1

    resources = client.get("/api/resources")
    assert resources.status_code == 200, resources.text
    assert len(resources.json()) >= 1


def test_wellness_preferences_and_personalized_recommendations(client):
    assert client.get("/api/recommendations").status_code == 401
    registration = client.post(
        "/api/auth/register",
        json={
            "name": "Yoga Learner",
            "email": "yoga-learner@example.com",
            "password": "Secret123",
            "confirm_password": "Secret123",
        },
    )
    assert registration.status_code == 200, registration.text
    headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}

    assert client.get("/api/preferences/wellness", headers=headers).json() is None
    saved = client.put(
        "/api/preferences/wellness",
        json={"interests": ["yoga"], "available_minutes": 3},
        headers=headers,
    )
    assert saved.status_code == 200, saved.text
    assert saved.json() == {"interests": ["yoga"], "available_minutes": 3}

    recommendations = client.get("/api/recommendations", headers=headers)
    assert recommendations.status_code == 200, recommendations.text
    body = recommendations.json()
    assert body["personalized"] is True
    assert body["items"]
    assert all(item["category"] == "Yoga" for item in body["items"])
    assert all("3-minute time window" in item["reason"] for item in body["items"])
    assert all(item["name"] != "Guided Relaxation" for item in body["items"])

    other_registration = client.post(
        "/api/auth/register",
        json={
            "name": "Another Learner",
            "email": "another-learner@example.com",
            "password": "Secret123",
            "confirm_password": "Secret123",
        },
    )
    other_headers = {"Authorization": f"Bearer {other_registration.json()['access_token']}"}
    assert client.get("/api/preferences/wellness", headers=other_headers).json() is None


def test_asana_library_search_filters_and_details(client):
    library = client.get("/api/asanas")
    assert library.status_code == 200, library.text
    assert len(library.json()) == 25

    search = client.get("/api/asanas", params={"q": "Tadasana"})
    assert search.status_code == 200, search.text
    assert [item["name"] for item in search.json()] == ["Mountain Pose"]

    balance = client.get("/api/asanas", params={"category": "balance"})
    assert [item["name"] for item in balance.json()] == ["Tree Pose"]

    short_poses = client.get("/api/asanas", params={"max_duration": 1})
    assert short_poses.status_code == 200, short_poses.text
    assert all(item["duration_minutes"] <= 1 for item in short_poses.json())

    tree_pose = next(item for item in library.json() if item["name"] == "Tree Pose")
    detail = client.get(f"/api/asanas/{tree_pose['id']}")
    assert detail.status_code == 200, detail.text
    assert detail.json()["modification"]
    assert detail.json()["safety_note"]
    assert client.get("/api/asanas/99999").status_code == 404
