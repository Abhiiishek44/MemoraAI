from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


# Allowed material types
MaterialType = Literal["text", "url", "document"]
MaterialStatus = Literal["uploaded", "processing", "completed", "failed"]


# Base Schema
class MaterialBase(BaseModel):
    topic_id: str
    user_id: str
    material_type: MaterialType

    title: Optional[str] = None
    processing_status: MaterialStatus = "uploaded"

    # Source fields
    content: Optional[str] = None      # for text
    file_name: Optional[str] = None    # for document
    file_path: Optional[str] = None    # for document
    source_url: Optional[str] = None   # for url


# Create Schema (used when uploading)
class MaterialCreate(MaterialBase):
        pass


# Update Schema
class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    source_url: Optional[str] = None
    status: Optional[MaterialStatus] = None


# Response Schema (returned to frontend)
class MaterialResponse(MaterialBase):
    id: str = Field(..., alias="_id")

    extracted_text: Optional[str] = None
    chunks_count: int = 0
    title: Optional[str] = None
    material_type: MaterialType
    processing_status: MaterialStatus
    error_message: Optional[str] = None
    file_url: Optional[str] = None  # URL to access the uploaded file (for documents)
    source_url: Optional[str] = None  # URL to access the original source (for URLs)
    text_preview: Optional[str] = None  # Preview of the text content (for text materials)
    mcq_count: int = 0
    flashcard_count: int = 0
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True