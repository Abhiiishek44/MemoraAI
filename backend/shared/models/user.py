"""
User Model - Simple MongoDB Schema for College Portfolio
Defines user document structure for MongoDB
"""
from datetime import datetime


from datetime import datetime

def create_user(name: str, email: str, password_hash: str):
    """Create a new user document"""

    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": "student",

        "profile_image": None,

        # learning stats
        "study_streak": 0,
        "tasks_completed": 0,
        "flashcards_reviewed": 0,
        "overall_progress": 0,

        # account status
        "is_active": True,
        # "email_verified": False,

        # timestamps
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None
    }

def create_topic(user_id, topic_name, description=None):
    return {
        "user_id": user_id,
        "topic_name": topic_name,
        "description": description,
         
        "materials_count": 0,
        "flashcards_count": 0,
        "tests_count": 0,

        "understanding_percentage": 0,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


def create_study_material(user_id, topic_id, material_type, content ,file_url=None, source_url=None):
    return {
        "user_id": user_id,
        "topic_id": topic_id,
        "material_type": material_type,
        "content": content,
        "file_url": file_url,
        "source_url": source_url,
        "is_processed": False,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


def create_flashcard(user_id, topic_id, question, answer, difficulty):
    return {
        "user_id": user_id,
        "topic_id": topic_id,
        "question": question,
        "answer": answer,
        "difficulty": difficulty, # easy, medium, hard
        "ease_counter": 0,
        "is_learned": False,
         "next_review": datetime.utcnow(),
    
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


def create_test(user_id, topic_id, questions):
    return {
        "user_id": user_id,
        "topic_id": topic_id,
        "total_questions": len(questions) if questions else 0,
        "questions": questions,
        "duration_minutes": 10,
        "is_attempted": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

def create_test_attempt(user_id, test_id, score, accuracy, time_taken):
    return {
        "user_id": user_id,
        "test_id": test_id,

        "score": score,
        "accuracy": accuracy,
        "time_taken": time_taken,

        "created_at": datetime.utcnow()
    }

def format_user_response(user):
    """Format user for API response (remove password)"""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "student"),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }
