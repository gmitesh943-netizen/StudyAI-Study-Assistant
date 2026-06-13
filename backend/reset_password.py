"""
Reset password for a user directly in the SQLite database.
Run: python reset_password.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import SessionLocal
from database.init_db import User
from utils.helpers import hash_password

EMAIL = "gmitesh943@gmail.com"
NEW_PASSWORD = "Admin@1234"

db = SessionLocal()
user = db.query(User).filter(User.email == EMAIL).first()

if not user:
    print("ERROR: No user found with email: " + EMAIL)
    db.close()
    sys.exit(1)

user.hashed_password = hash_password(NEW_PASSWORD)
db.commit()
db.close()

print("SUCCESS: Password reset done!")
print("  Email   : " + EMAIL)
print("  Password: " + NEW_PASSWORD)
print("  Role    : " + ("Admin" if user.is_admin else "Student"))
print("")
print("Login at: http://localhost:3000/sign-in")
