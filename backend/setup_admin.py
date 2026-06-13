#!/usr/bin/env python
"""
Setup Script - Create First Admin User
Run this after creating your first user account via web signup
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database.connection import SessionLocal
from database.init_db import User

def make_user_admin(email: str) -> bool:
    """Make a user an admin by email"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email '{email}' not found")
            return False
        
        if user.is_admin:
            print(f"ℹ️ User '{user.username}' is already an admin")
            return True
        
        user.is_admin = True
        db.commit()
        print(f"✅ User '{user.username}' ({email}) is now an ADMIN!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def list_users() -> None:
    """List all users in database"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("No users found")
            return
        
        print("\n📋 Users in Database:")
        print("─" * 60)
        for user in users:
            role = "👑 ADMIN" if user.is_admin else "👤 User"
            status = "🟢 Active" if user.is_active else "🔴 Inactive"
            print(f"  {user.id}. {user.username} ({user.email}) {role} {status}")
        print("─" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  AI STUDY APP - Admin Setup Tool")
    print("=" * 60)
    print()
    
    # List current users
    list_users()
    print()
    
    # Ask what to do
    print("Options:")
    print("  1. Make a user an admin")
    print("  2. Exit")
    print()
    
    choice = input("Choose option (1 or 2): ").strip()
    
    if choice == "1":
        email = input("\nEnter user email: ").strip()
        if email:
            make_user_admin(email)
        else:
            print("❌ Email cannot be empty")
    elif choice == "2":
        print("Goodbye!")
    else:
        print("❌ Invalid choice")
    
    print()
