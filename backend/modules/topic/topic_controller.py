from typing import List, Dict, Any
from modules.topic.topic_schema import TopicCreate, TopicUpdate, TopicResponse
from modules.topic.topic_services import TopicService

async def create_topic_controller(user_id: str, topic_data: TopicCreate) -> TopicResponse:
    return await TopicService.create_topic(user_id, topic_data)

async def get_topics_controller(user_id: str, skip: int = 0, limit: int = 100) -> List[TopicResponse]:
    return await TopicService.get_topics(user_id, skip, limit)

async def get_topic_controller(user_id: str, topic_id: str) -> TopicResponse:
    return await TopicService.get_topic_by_id(user_id, topic_id)

async def update_topic_controller(user_id: str, topic_id: str, topic_data: TopicUpdate) -> TopicResponse:
    return await TopicService.update_topic(user_id, topic_id, topic_data)

async def delete_topic_controller(user_id: str, topic_id: str) -> Dict[str, Any]:
    await TopicService.delete_topic(user_id, topic_id)
    return {"status": "success", "message": "Topic deleted successfully"}
