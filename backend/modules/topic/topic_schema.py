from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TopicBase(BaseModel):
    name: str = Field(..., example="Machine Learning")
    description: Optional[str] = Field(None, example="Basics of ML")

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    understanding: Optional[int] = None
    flashcards: Optional[int] = None
    tests: Optional[int] = None

class TopicResponse(TopicBase):
    id: str = Field(..., alias="id")
    user_id: str
    understanding: int = 0
    flashcards: int = 0
    tests: int = 0
    files: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
