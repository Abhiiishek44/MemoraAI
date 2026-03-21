"""
Production-Ready MongoDB Schema for Study Platform
"""

from datetime import datetime
import string
from bson import ObjectId
from typing import List, Optional


# =========================
# USER
# =========================
def create_user(name: str, email: str, password_hash: str):
    return {
        "name": name,
        "email": email.lower(),
        "password_hash": password_hash,

        "role": "student",  # student | admin

        "profile_image": None,

        # learning stats
        "study_streak": 0,
        "tasks_completed": 0,
        "flashcards_reviewed": 0,
        "overall_progress": 0,

        # account status
        "is_active": True,
        "email_verified": False,

        # security
        "refresh_token": None,  # store hashed token in real apps

        # timestamps
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,

        # soft delete
        "is_deleted": False
    }


# =========================
# TOPIC
# =========================
def create_topic(user_id: str, topic_name: str, description: Optional[str] = None):
    return {
        "user_id": ObjectId(user_id),
        "topic_name": topic_name,
        "description": description,

        "materials_count": 0,
        "flashcards_count": 0,
        "tests_count": 0,
        

        "understanding_percentage": 0,

        "is_archived": False,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


# =========================
# STUDY MATERIAL
# =========================


def create_material(
    user_id: str,
    topic_id: str,
    material_type: str,   # text | document | url
    content: str = None,
    file_name: str = None,
    file_path: str = None,
    source_url: str = None
):
    return {
        "user_id": ObjectId(user_id),
        "topic_id": ObjectId(topic_id),

        # Material Type
        "material_type": material_type,  # text | document | url

        # Input Sources
        "content": content,          # for text
        "file_name": file_name,      # original file name
        "file_path": file_path,      # stored file path
        "source_url": source_url,    # for URL

        # AI Processing
        "extracted_text": None,
        "chunks_count": 0,

        # Processing Status
        "status": "uploaded",  # uploaded | processing | completed | failed
        "error_message": None,

        # AI Results Flags
        "summary_generated": False,
        "mcq_generated": False,
        "flashcard_generated": False,

        # Timestamps
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

# =========================
# FLASHCARD (Spaced Repetition Ready)
# =========================
def create_flashcard(
    user_id: str,
    topic_id: str,
    material_id: str,
    chunk_index: int,
    question: str,
    answer: str,
    difficulty: str  # easy | medium | hard
):
    return {
        "user_id": ObjectId(user_id),
        "topic_id": ObjectId(topic_id),
        "material_id": ObjectId(material_id),
        "chunk_index": chunk_index,

        "question": question,
        "answer": answer,
        "difficulty": difficulty,

        # Spaced Repetition System (SRS)
        "ease_factor": 2.5,
        "interval": 1,
        "ease_counter": 0,
        "review_count": 0,
        "last_reviewed": None,
        "next_review": datetime.utcnow(),

        # Learning state
        "is_learned": False,
        "is_deleted": False,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }




# =========================
# MCQ
# =========================

def create_mcq(
    user_id: str,
    topic_id: str,
    material_id: str,
    chunk_index: int,
    question: str,
    options: list,
    answer: str,
    explanation: str = None,
    difficulty: str = "medium"
):
    return {
        "user_id": ObjectId(user_id),
        "topic_id": ObjectId(topic_id),
        "material_id": ObjectId(material_id),
        "chunk_index": chunk_index,

        "question": question,
        "options": options,  # ["A", "B", "C", "D"]
        "answer": answer,
        "explanation": explanation,
        "difficulty": difficulty,

        # User performance tracking
        "times_attempted": 0,
        "times_correct": 0,
        "times_wrong": 0,

        "is_deleted": False,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

# =========================
# TEST
# =========================
def create_test(
    user_id: str,
    topic_id: str,
    questions: List[dict]
):
    return {
        "user_id": ObjectId(user_id),
        "topic_id": ObjectId(topic_id),

        "total_questions": len(questions) if questions else 0,
        "questions": questions,  # OK for small scale

        "duration_minutes": 10,
        "is_attempted": False,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


# =========================
# TEST ATTEMPT
# =========================
def create_test_attempt(
    user_id: str,
    test_id: str,
    score: int,
    accuracy: float,
    time_taken: int,
    answers: Optional[List[dict]] = None
):
    return {
        "user_id": ObjectId(user_id),
        "test_id": ObjectId(test_id),

        "score": score,
        "accuracy": accuracy,
        "time_taken": time_taken,

        "answers": answers or [],

        "created_at": datetime.utcnow()
    }


# =========================
# RESPONSE FORMATTER
# =========================
def format_user_response(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "student"),
        "profile_image": user.get("profile_image"),

        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }