import pytest

def test_register_user(client):
    # Happy path registration
    response = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "username": "newuser", "password": "Password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "hashed_password" not in data

    # Registering duplicate email
    response_dup_email = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "username": "otheruser", "password": "Password123"}
    )
    assert response_dup_email.status_code == 400
    assert "Email already registered" in response_dup_email.json()["detail"]

    # Registering duplicate username
    response_dup_user = client.post(
        "/api/auth/register",
        json={"email": "other@example.com", "username": "newuser", "password": "Password123"}
    )
    assert response_dup_user.status_code == 400
    assert "Username already taken" in response_dup_user.json()["detail"]


def test_login_user(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "username": "testuser", "password": "Password123"}
    )

    # Correct login
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Wrong credentials login
    response_wrong = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "WrongPassword"}
    )
    assert response_wrong.status_code == 401
    assert "Invalid email or password" in response_wrong.json()["detail"]


def test_get_current_user_me(client):
    # Register and login to get token
    client.post(
        "/api/auth/register",
        json={"email": "me@example.com", "username": "meuser", "password": "Password123"}
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "me@example.com", "password": "Password123"}
    )
    token = login_res.json()["access_token"]

    # Fetch user details
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["username"] == "meuser"

    # Fetch without credentials
    response_no_auth = client.get("/api/auth/me")
    assert response_no_auth.status_code == 401
