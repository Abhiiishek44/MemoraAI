from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile, Form
from core.dependencies import get_current_user
from modules.topic.topic_schema import TopicCreate, TopicUpdate, TopicResponse
from modules.topic.topic_controller import (
    create_topic_controller,
    get_topics_controller,
    get_topic_controller,
    update_topic_controller,
    delete_topic_controller
)

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.post(
    "/",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic"
)
async def create_topic(
    topic: TopicCreate,
    current_user: dict = Depends(get_current_user)
) -> TopicResponse:
    """Create a new topic workspace"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await create_topic_controller(user_id, topic)

@router.get(
    "/",
    response_model=List[TopicResponse],
    summary="Get all topics"
)
async def get_topics(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> List[TopicResponse]:
    """Get all topics for the current user"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await get_topics_controller(user_id, skip, limit)

@router.get(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Get topic by ID"
)
async def get_topic(
    topic_id: str,
    current_user: dict = Depends(get_current_user)
) -> TopicResponse:
    """Get a specific topic by ID"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await get_topic_controller(user_id, topic_id)

@router.patch(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Update a topic"
)
async def update_topic(
    topic_id: str,
    topic_update: TopicUpdate,
    current_user: dict = Depends(get_current_user)
) -> TopicResponse:
    """Update a specific topic"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await update_topic_controller(user_id, topic_id, topic_update)

@router.delete(
    "/{topic_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a topic"
)
async def delete_topic(
    topic_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Delete a specific topic"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    return await delete_topic_controller(user_id, topic_id)

@router.post(
    "/{topic_id}/upload",
    response_model=TopicResponse,
    summary="Upload material to a topic"
)
async def upload_material(
    topic_id: str,
    text_content: str = Form(""),
    urls: List[str] = Form([]),
    files: List[UploadFile] = File([]),
    current_user: dict = Depends(get_current_user)
) -> TopicResponse:
    """Upload texts, urls, and documents to a topic"""
    user_id = str(current_user.get("_id") or current_user.get("id"))
    
    # Save files if there are any
    saved_files = []
    if files:
        import os
        import shutil
        upload_dir = f"uploads/{user_id}/{topic_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            if file.filename:
                file_location = f"{upload_dir}/{file.filename}"
                with open(file_location, "wb+") as file_object:
                    shutil.copyfileobj(file.file, file_object)
                saved_files.append(file_location)
                
    # In a real app we'd trigger background processing tasks, update metrics
    # and add these document objects into a DB collection linked to the topic.
    # We update the topic stats for now returning new state
    
    # Get current topic
    topic = await get_topic_controller(user_id, topic_id)
    
    # Simple metric bump simulation
    update_data = TopicUpdate(
        files=topic.files + len(saved_files),
        flashcards=topic.flashcards + 5,
        tests=topic.tests + 1,
        understanding=min(100, topic.understanding + 10)
    )
    
    return await update_topic_controller(user_id, topic_id, update_data)
