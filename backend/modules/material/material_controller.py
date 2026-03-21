
from fastapi import HTTPException
from shared.utils.logger import logger
from modules.material.material_services import material_service

class MaterialController:
    @staticmethod
    async def upload_material(user_id: str, topic_id: str,text, url, file):
        try:
            if not text and not url and not file:
                raise HTTPException(status_code=400, detail="provide text, url or file")
            
            return await material_service.upload_material_service(user_id, topic_id, text, url, file)
        
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Material upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload material")
        
        