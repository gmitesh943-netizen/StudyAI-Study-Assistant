"""
Create a new Student account directly in the database.
Run: python create_student.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import SessionLocal
from database.init_db import User
from utils.helpers import hash_password

# Student credentials - change these if needed
EMAIL    = "student@studyai.com"
USERNAME = "student"
PASSWORD = "Student@1234"

db = SessionLocal()

# Check if already exists
existing = db.query(User).filter(User.email == EMAIL).first()
if existing:
    print("INFO: Student account already exists with email: " + EMAIL)
    print("Password set to: " + PASSWORD)
    existing.hashed_password = hash_password(PASSWORD)
    existing.is_admin = False
    db.commit()
    db.close()
    print("Account updated successfully!")
else:
    student = User(
        email=EMAIL,
        username=USERNAME,
        hashed_password=hash_password(PASSWORD),
        is_admin=False,
        is_active=True,
    )
    db.add(student)
    db.commit()
    db.close()
    print("SUCCESS: Student account created!")

print("")
print("  Email   : " + EMAIL)
print("  Password: " + PASSWORD)
print("  Role    : Student")
print("")
print("Login at: http://localhost:3000/sign-in")
print("Select the 'Student' tab when logging in.")
