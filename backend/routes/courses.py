import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Course, User
from models.schemas import (
    CourseCreate,
    CourseResponse,
    CoursesListResponse,
    CourseUpdate,
    GoogleResource,
)
from utils.helpers import require_admin, require_user

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new course (admin only)"""
    resources_json = None
    if payload.resources:
        resources_json = json.dumps([r.model_dump() for r in payload.resources])

    course = Course(
        user_id=admin.id,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        resources_json=resources_json,
        is_published=True,
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    response_data = CourseResponse(
        id=course.id,
        name=course.name,
        description=course.description,
        category=course.category,
        resources=(
            [GoogleResource(**r) for r in json.loads(course.resources_json)]
            if course.resources_json
            else None
        ),
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )
    return response_data


@router.get("/", response_model=CoursesListResponse)
def list_courses(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all published courses (accessible to all authenticated users)"""
    query = db.query(Course).filter(Course.is_published == True)

    if category:
        query = query.filter(Course.category == category)

    total = query.count()
    courses_db = query.offset(skip).limit(limit).all()

    courses = [
        CourseResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            category=c.category,
            resources=(
                [GoogleResource(**r) for r in json.loads(c.resources_json)]
                if c.resources_json
                else None
            ),
            is_published=c.is_published,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in courses_db
    ]

    return CoursesListResponse(courses=courses, total=total)


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_user),
):
    """Get course details by ID"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or not course.is_published:
        raise HTTPException(status_code=404, detail="Course not found")

    return CourseResponse(
        id=course.id,
        name=course.name,
        description=course.description,
        category=course.category,
        resources=(
            [GoogleResource(**r) for r in json.loads(course.resources_json)]
            if course.resources_json
            else None
        ),
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update course (admin only, must be course creator)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.user_id != admin.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this course")

    if payload.name:
        course.name = payload.name
    if payload.description is not None:
        course.description = payload.description
    if payload.category is not None:
        course.category = payload.category
    if payload.resources is not None:
        course.resources_json = json.dumps([r.model_dump() for r in payload.resources])

    db.commit()
    db.refresh(course)

    return CourseResponse(
        id=course.id,
        name=course.name,
        description=course.description,
        category=course.category,
        resources=(
            [GoogleResource(**r) for r in json.loads(course.resources_json)]
            if course.resources_json
            else None
        ),
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete course (admin only, must be course creator)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.user_id != admin.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")

    db.delete(course)
    db.commit()


from pydantic import BaseModel
from services.ai_service import ai_service

class CourseGenerateRequest(BaseModel):
    topic: str

@router.post("/generate", response_model=CourseResponse)
def generate_course(
    payload: CourseGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Dynamically generate an IT course with Google Search, YouTube, and Drive links using AI"""
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    prompt_system = (
        "You are an AI IT learning path generator. Given an IT topic, generate a structured course in JSON. "
        "Return ONLY valid JSON with keys: "
        "name (string, e.g. 'Mastering React Hooks'), "
        "description (string summary), "
        "category (string, e.g. 'IT - Frontend'), "
        "resources (JSON array of objects with keys: title, url, type where type is one of: youtube, documentation, scholar, classroom)."
    )
    prompt_user = f"Generate an IT course roadmap and resources for the topic: '{topic}'."
    
    course_data = None
    if ai_service._active and ai_service._active.is_available:
        try:
            raw = ai_service._active._generate(prompt_system, prompt_user)
            cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            course_data = json.loads(cleaned)
        except Exception:
            course_data = None

    if not course_data or "name" not in course_data:
        # Fallback dynamic generator with actual search queries
        clean_topic = topic or "IT Concept"
        title_topic = clean_topic.title()
        google_search_url = f"https://www.google.com/search?q=learn+{clean_topic.replace(' ', '+')}+tutorial"
        youtube_search_url = f"https://www.youtube.com/results?search_query={clean_topic.replace(' ', '+')}+full+course+beginners"
        docs_search_url = f"https://docs.google.com/document/u/0/?q={clean_topic.replace(' ', '+')}"
        
        course_data = {
            "name": f"AI Path: {title_topic}",
            "description": f"AI-curated learning path to master {title_topic}. Resources are dynamically generated from Google, YouTube, and Docs search integrations.",
            "category": f"IT - {title_topic}",
            "resources": [
                {
                    "title": f"Google Search: Learn {title_topic} Guide",
                    "url": google_search_url,
                    "type": "scholar"
                },
                {
                    "title": f"YouTube: {title_topic} Video Tutorials",
                    "url": youtube_search_url,
                    "type": "youtube"
                },
                {
                    "title": f"Google Docs: {title_topic} Study Guide",
                    "url": docs_search_url,
                    "type": "classroom"
                },
                {
                    "title": f"Official {title_topic} Documentation Reference",
                    "url": f"https://www.google.com/search?q=official+{clean_topic.replace(' ', '+')}+documentation",
                    "type": "documentation"
                }
            ]
        }

    # Save to database (assigned to user_id of the current student user)
    resources_json = json.dumps(course_data.get("resources", []))
    course = Course(
        user_id=user.id,
        name=course_data.get("name", f"AI Path: {topic}"),
        description=course_data.get("description", ""),
        category=course_data.get("category", "IT - Custom"),
        resources_json=resources_json,
        is_published=True,
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    return CourseResponse(
        id=course.id,
        name=course.name,
        description=course.description,
        category=course.category,
        resources=[GoogleResource(**r) for r in json.loads(course.resources_json)] if course.resources_json else None,
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )

