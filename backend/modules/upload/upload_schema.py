from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Literal



class UploadBase(BaseModel):
    file_name: str = Field(..., example="example.pdf")
    file_path: str = Field(..., example="/path/to/file")
    file_type: str = Field(..., example="pdf")
    topic_id: str = Field(..., example="1")
    user_id: str = Field(..., example="1")

class UploadCreate(UploadBase):
    

class UploadUpdate(BaseModel):
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    topic_id: Optional[str] = None
    user_id: Optional[str] = None

class UploadResponse(UploadBase):
    id: str = Field(..., alias="id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True