#!/usr/bin/env python
"""
Create Default Admin User
Run this once to create the admin account.
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database.connection import SessionLocal
from database.init_db import User, init_db
from utils.helpers import hash_password

# =============================================
#   ADMIN CREDENTIALS - CHANGE IF YOU WANT
# =============================================
ADMIN_EMAIL    = "admin@studyapp.com"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin@123"
# =============================================

def create_admin():
    # Make sure tables exist
    init_db()

    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            if not existing.is_admin:
                existing.is_admin = True
                db.commit()
                print("Existing user promoted to ADMIN!")
            else:
                print("Admin user already exists!")
            return

        # Create new admin user
        hashed_pw = hash_password(ADMIN_PASSWORD)
        admin_user = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            hashed_password=hashed_pw,
            is_active=True,
            is_admin=True,
        )
        db.add(admin_user)
        db.commit()

        print("=" * 45)
        print("  ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 45)
        print(f"  Email    : {ADMIN_EMAIL}")
        print(f"  Username : {ADMIN_USERNAME}")
        print(f"  Password : {ADMIN_PASSWORD}")
        print("=" * 45)
        print()
        print("  Login at: http://localhost:3000/sign-in")
        print()

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
