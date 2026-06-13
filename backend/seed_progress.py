"""
Seed default progress data for existing users in the database.
Run: python seed_progress.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import SessionLocal
from database.init_db import User, Progress

def seed_progress():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("No users found in the database. Please run create_student.py or setup_admin.py first.")
            return

        default_subjects = [
            {"subject": "Operating Systems", "value": 65.0, "study_hours": 8.5},
            {"subject": "Data Structures", "value": 45.0, "study_hours": 5.2},
            {"subject": "Cloud Computing", "value": 85.0, "study_hours": 12.0},
            {"subject": "Database Systems", "value": 75.0, "study_hours": 9.3},
            {"subject": "Web Dev", "value": 90.0, "study_hours": 15.5}
        ]

        for user in users:
            print(f"Checking progress data for user: {user.username} ({user.email})...")
            # Check if user already has progress rows
            existing_progress = db.query(Progress).filter(Progress.user_id == user.id).count()
            if existing_progress > 0:
                print(f"  -> User already has {existing_progress} progress records. Updating them...")
                for item in default_subjects:
                    row = db.query(Progress).filter(Progress.user_id == user.id, Progress.subject == item["subject"]).first()
                    if row:
                        row.value = item["value"]
                        row.study_hours = item["study_hours"]
                    else:
                        new_progress = Progress(
                            user_id=user.id,
                            subject=item["subject"],
                            value=item["value"],
                            study_hours=item["study_hours"]
                        )
                        db.add(new_progress)
            else:
                print(f"  -> Seeding new progress records...")
                for item in default_subjects:
                    new_progress = Progress(
                        user_id=user.id,
                        subject=item["subject"],
                        value=item["value"],
                        study_hours=item["study_hours"]
                    )
                    db.add(new_progress)
        
        db.commit()
        print("\nSUCCESS: Subject progress seeded successfully for all users!")
    except Exception as e:
        print(f"Error seeding progress: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_progress()
