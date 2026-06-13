import pytest

def test_list_courses(client):
    # Fetch courses list (public endpoint, should work without token)
    response = client.get("/api/courses")
    assert response.status_code == 200
    data = response.json()
    assert "courses" in data
    assert "total" in data


def test_generate_course(client):
    # Register and login to get token
    client.post(
        "/api/auth/register",
        json={"email": "coursegen@example.com", "username": "coursegen", "password": "Password123"}
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "coursegen@example.com", "password": "Password123"}
    )
    token = login_res.json()["access_token"]

    # Try generating a course with valid token
    response = client.post(
        "/api/courses/generate",
        json={"topic": "Docker Basics"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "Docker Basics" in data["name"] or "Docker" in data["name"]
    assert "resources" in data

    # Try generating a course without auth token (should fail with 401)
    response_unauth = client.post(
        "/api/courses/generate",
        json={"topic": "Docker Basics"}
    )
    assert response_unauth.status_code == 401
