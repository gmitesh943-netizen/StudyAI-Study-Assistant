import pytest

def test_security_headers(client):
    # Fetch a public endpoint
    response = client.get("/api/courses")
    assert response.status_code == 200
    
    # Assert presence and values of security headers
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age" in response.headers.get("Strict-Transport-Security", "")
    assert "default-src" in response.headers.get("Content-Security-Policy", "")


def test_rate_limiting(client):
    # The register endpoint has a limit of 3 requests per minute per IP.
    # We will trigger it by making 4 requests.
    for i in range(3):
        # We don't care if it's 201 or 400 (duplicate error), we just want to hit the route.
        # However, to isolate rate limiter, let's use unique emails.
        res = client.post(
            "/api/auth/register",
            json={"email": f"rate{i}@example.com", "username": f"rateuser{i}", "password": "Password123"}
        )
        # It shouldn't be 429 yet
        assert res.status_code != 429

    # The 4th request must trigger the rate limiter (429)
    res_limit = client.post(
        "/api/auth/register",
        json={"email": "rate_exceeded@example.com", "username": "rateuser_exc", "password": "Password123"}
    )
    assert res_limit.status_code == 429
    assert "Too many requests" in res_limit.json()["detail"]
    assert "Retry-After" in res_limit.headers


def test_metrics_telemetry(client, db):
    from database.init_db import User
    from utils.helpers import hash_password

    # Create an admin user directly in the test database
    admin_user = User(
        email="admin_test@example.com",
        username="admin_test",
        hashed_password=hash_password("Password123"),
        is_admin=True,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    # Login as admin to get token
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin_test@example.com", "password": "Password123"}
    )
    token = login_res.json()["access_token"]

    # Fetch admin metrics
    metrics_res = client.get(
        "/api/admin/metrics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    
    assert "total_requests" in data
    assert "auth_failures_count" in data
    assert "route_counts" in data
    assert "average_latencies_seconds" in data
    assert data["total_requests"] > 0
