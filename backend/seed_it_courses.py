#!/usr/bin/env python
"""
Seed IT Field Courses and Google Resources
"""

import os
import sys
import json
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database.connection import SessionLocal
from database.init_db import Course, User, init_db

COURSES_DATA = [
    {
        "name": "Python Programming & Data Science",
        "description": "Learn Python from basic syntax to data analysis. Explore variable types, loops, OOP concepts, Pandas, NumPy, and basic data visualization.",
        "category": "IT - Python",
        "resources": [
            {
                "title": "Python for Beginners - Full Course (freeCodeCamp)",
                "url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
                "type": "youtube"
            },
            {
                "title": "Official Python 3 Documentation",
                "url": "https://docs.python.org/3/",
                "type": "documentation"
            },
            {
                "title": "Python Data Science Handbook",
                "url": "https://jakevdp.github.io/PythonDataScienceHandbook/",
                "type": "documentation"
            },
            {
                "title": "A Gentle Introduction to Data Science",
                "url": "https://scholar.google.com/scholar?q=Data+Science+Introduction",
                "type": "scholar"
            }
        ]
    },
    {
        "name": "Full Stack Web Development (MERN)",
        "description": "Master Modern Web Development using HTML5, CSS3, JavaScript, MongoDB, Express, React, and Node.js. Build responsive and interactive full-stack apps.",
        "category": "IT - Web Development",
        "resources": [
            {
                "title": "HTML & CSS Tutorial - Level up your Web Dev skills",
                "url": "https://www.youtube.com/watch?v=mJgBOIoGihA",
                "type": "youtube"
            },
            {
                "title": "Modern JavaScript Tutorial (JavaScript.info)",
                "url": "https://javascript.info/",
                "type": "documentation"
            },
            {
                "title": "MDN Web Docs - Web Technologies Guide",
                "url": "https://developer.mozilla.org/en-US/",
                "type": "documentation"
            },
            {
                "title": "FreeCodeCamp JavaScript Full Course",
                "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                "type": "youtube"
            }
        ]
    },
    {
        "name": "React, Next.js & Frontend Architectures",
        "description": "Deep dive into component lifecycle, hooks, state management (Redux/Zustand), Server Components, API routes, and Server-Side Rendering (SSR) in Next.js.",
        "category": "IT - Frontend",
        "resources": [
            {
                "title": "React JS Full Course for Beginners 2024",
                "url": "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                "type": "youtube"
            },
            {
                "title": "Official React Documentation",
                "url": "https://react.dev/",
                "type": "documentation"
            },
            {
                "title": "Next.js 14+ Developer Docs",
                "url": "https://nextjs.org/docs",
                "type": "documentation"
            },
            {
                "title": "Tailwind CSS Styling Tutorial",
                "url": "https://www.youtube.com/watch?v=lCxcTsOHr5I",
                "type": "youtube"
            }
        ]
    },
    {
        "name": "Data Structures & Algorithms (DSA) in CS",
        "description": "Essential CS fundamentals including Big-O notation, Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, Graphs, Sorting, Searching, and Dynamic Programming.",
        "category": "IT - Computer Science",
        "resources": [
            {
                "title": "Data Structures and Algorithms - Full Course",
                "url": "https://www.youtube.com/watch?v=8hly31xKjns",
                "type": "youtube"
            },
            {
                "title": "GeeksforGeeks DSA Study Materials",
                "url": "https://www.geeksforgeeks.org/data-structures/",
                "type": "documentation"
            },
            {
                "title": "Algorithms (4th Edition) - Princeton University",
                "url": "https://algs4.cs.princeton.edu/home/",
                "type": "scholar"
            }
        ]
    },
    {
        "name": "Relational Databases, SQL & MongoDB",
        "description": "Design efficient database schemas, write optimized SQL queries, handle transactions, manage indexes, and learn NoSQL database modeling with MongoDB.",
        "category": "IT - Databases",
        "resources": [
            {
                "title": "SQL Tutorial - Full Database Course for Beginners",
                "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
                "type": "youtube"
            },
            {
                "title": "PostgreSQL Tutorial for Developers",
                "url": "https://www.postgresqltutorial.com/",
                "type": "documentation"
            },
            {
                "title": "MongoDB Developer Manual",
                "url": "https://www.mongodb.com/docs/manual/",
                "type": "documentation"
            }
        ]
    },
    {
        "name": "Version Control with Git & GitHub",
        "description": "Learn to manage source code changes, work in branches, resolve merge conflicts, make pull requests, and host repositories on GitHub.",
        "category": "IT - Software Engineering",
        "resources": [
            {
                "title": "Git and GitHub for Beginners - Crash Course",
                "url": "https://www.youtube.com/watch?v=RGOj5yH7evk",
                "type": "youtube"
            },
            {
                "title": "Official Git Documentation Reference",
                "url": "https://git-scm.com/doc",
                "type": "documentation"
            },
            {
                "title": "GitHub Learning Path & Flow",
                "url": "https://docs.github.com/en/get-started",
                "type": "documentation"
            }
        ]
    },
    {
        "name": "Cloud Computing, Docker & DevOps",
        "description": "Understand microservices containerization using Docker. Automate deployment with CI/CD pipelines, and introduction to AWS & Kubernetes architecture.",
        "category": "IT - DevOps",
        "resources": [
            {
                "title": "Docker Tutorial for Beginners (Programming with Mosh)",
                "url": "https://www.youtube.com/watch?v=pTFZFxd4hOI",
                "type": "youtube"
            },
            {
                "title": "Docker Docs Quick Start",
                "url": "https://docs.docker.com/get-started/",
                "type": "documentation"
            },
            {
                "title": "Kubernetes Official Interactive Tutorial",
                "url": "https://kubernetes.io/docs/tutorials/",
                "type": "documentation"
            }
        ]
    },
    {
        "name": "Cybersecurity & Network Security Essentials",
        "description": "Understand standard networking protocols (TCP/IP), firewalls, cryptography fundamentals, common security vulnerabilities (OWASP Top 10), and defense mechanisms.",
        "category": "IT - Security",
        "resources": [
            {
                "title": "Cyber Security Full Course for Beginners",
                "url": "https://www.youtube.com/watch?v=U_P23SqJaDc",
                "type": "youtube"
            },
            {
                "title": "OWASP Top 10 Security Risks Guide",
                "url": "https://owasp.org/www-project-top-ten/",
                "type": "documentation"
            },
            {
                "title": "Introduction to Network Cryptography",
                "url": "https://scholar.google.com/scholar?q=Network+Cryptography+Introduction",
                "type": "scholar"
            }
        ]
    }
]

def seed_courses():
    # Make sure tables exist
    init_db()

    db = SessionLocal()
    try:
        # Find admin user (prefer 'admin' email)
        admin = db.query(User).filter(User.is_admin == True).first()
        if not admin:
            print("❌ Admin user not found! Please run create_admin.py first.")
            return

        print(f"Using Admin User ID: {admin.id} ({admin.username})")

        # Clear existing courses to keep app exclusively IT-focused
        print("Clearing old courses to keep it strictly IT-focused...")
        db.query(Course).delete()
        db.commit()

        # Add new courses
        for course_info in COURSES_DATA:
            res_json = json.dumps(course_info["resources"])
            course = Course(
                user_id=admin.id,
                name=course_info["name"],
                description=course_info["description"],
                category=course_info["category"],
                resources_json=res_json,
                is_published=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(course)
        
        db.commit()
        print("Successfully seeded 8 high-quality IT Field courses into database!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()
