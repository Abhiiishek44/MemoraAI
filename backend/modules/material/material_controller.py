
from fastapi import HTTPException
from shared.utils.logger import logger
from modules.material.material_service import MaterialService
class MaterialController:
    @staticmethod
    async def upload_material(topic_id: str, user_id: str, text, url, file, background_tasks):
        try:
            if not text and not url and not file:
                raise HTTPException(status_code=400, detail="provide text, url or file")
            
            return await MaterialService.upload_material(topic_id, user_id, text, url, file, background_tasks)
        
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Material upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload material")
        
    @staticmethod
    async def get_materials(topic_id: str, user_id: str):
        try:
            return await MaterialService.get_materials_by_topic(topic_id, user_id)
        except Exception as e:
            logger.error(f"Get materials error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get materials")  
    
    # async deleteMaterial(material_id: str):
    #     try:
    #         return await MaterialService.delete_material(material_id)
    #     except Exception as e:
    #         logger.error(f"Delete material error: {str(e)}")
    #         raise HTTPException(status_code=500, detail="Failed to delete material")  
    
