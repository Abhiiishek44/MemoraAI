from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status

from shared.config.database import mongodb
from modules.topic.topic_schema import TopicCreate, TopicUpdate, TopicResponse

class TopicService:
    @staticmethod
    async def create_topic(user_id: str, topic_data: TopicCreate) -> TopicResponse:
        topic_dict = topic_data.dict()
        topic_dict["user_id"] = user_id
        topic_dict["understanding"] = 0
        topic_dict["flashcards"] = 0
        topic_dict["tests"] = 0
        topic_dict["files"] = 0
        topic_dict["created_at"] = datetime.utcnow()
        topic_dict["updated_at"] = datetime.utcnow()

        result = await mongodb.db.topics.insert_one(topic_dict)
        topic_dict["id"] = str(result.inserted_id)
        if "_id" in topic_dict:
            del topic_dict["_id"]
        return TopicResponse(**topic_dict)

    @staticmethod
    async def get_topics(user_id: str, skip: int = 0, limit: int = 100) -> List[TopicResponse]:
        cursor = mongodb.db.topics.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)
        topics = await cursor.to_list(length=limit)
        result = []
        for topic in topics:
            topic["id"] = str(topic.pop("_id"))
            result.append(TopicResponse(**topic))
        return result

    @staticmethod
    async def get_topic_by_id(user_id: str, topic_id: str) -> TopicResponse:
        if not ObjectId.is_valid(topic_id):
            raise HTTPException(status_code=400, detail="Invalid topic ID")
            
        topic = await mongodb.db.topics.find_one({
            "_id": ObjectId(topic_id),
            "user_id": user_id
        })
        
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        topic["id"] = str(topic.pop("_id"))
        return TopicResponse(**topic)

    @staticmethod
    async def update_topic(user_id: str, topic_id: str, topic_data: TopicUpdate) -> TopicResponse:
        if not ObjectId.is_valid(topic_id):
            raise HTTPException(status_code=400, detail="Invalid topic ID")
            
        update_data = {k: v for k, v in topic_data.dict(exclude_unset=True).items()}
        if not update_data:
            return await TopicService.get_topic_by_id(user_id, topic_id)
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await mongodb.db.topics.update_one(
            {"_id": ObjectId(topic_id), "user_id": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return await TopicService.get_topic_by_id(user_id, topic_id)

    @staticmethod
    async def delete_topic(user_id: str, topic_id: str) -> bool:
        if not ObjectId.is_valid(topic_id):
            raise HTTPException(status_code=400, detail="Invalid topic ID")
            
        result = await mongodb.db.topics.delete_one({
            "_id": ObjectId(topic_id),
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        return True
