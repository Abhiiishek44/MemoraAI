import os
import uuid
from datetime import datetime
from modules.material.material_schema import MaterialCreate, MaterialResponse
from shared.config.database import mongodb
from modules.ai.ai_background_pipline import process_material_pipeline as process_material
from shared.utils.logger import logger

UPLOAD_DIR = "uploads"


class MaterialService:

    @staticmethod
    async def upload_material(topic_id, user_id, text, url, file, background_tasks):
        try:
            materials_created = []

            # TEXT MATERIAL
            if text:
                logger.info("Uploading text material")

                doc = MaterialCreate(
                    user_id=user_id,
                    topic_id=topic_id,
                    material_type="text",
                    title="Text Notes",
                    content=text
                )

                doc_dict = doc.model_dump()
                doc_dict["created_at"] = doc_dict.get("created_at", datetime.utcnow())
                doc_dict["updated_at"] = doc_dict.get("updated_at", datetime.utcnow())

                result = await mongodb.db.materials.insert_one(doc_dict)
                material_id = str(result.inserted_id)
                materials_created.append(material_id)

                background_tasks.add_task(process_material, material_id)
                logger.info(f"Text material created: {material_id}")

            # URL MATERIAL
            if url:
                logger.info("Uploading URL material")

                doc = MaterialCreate(
                    user_id=user_id,
                    topic_id=topic_id,
                    material_type="url",
                    title=url,
                    source_url=url
                )

                doc_dict = doc.model_dump()
                doc_dict["created_at"] = doc_dict.get("created_at", datetime.utcnow())
                doc_dict["updated_at"] = doc_dict.get("updated_at", datetime.utcnow())

                result = await mongodb.db.materials.insert_one(doc_dict)
                material_id = str(result.inserted_id)
                materials_created.append(material_id)

                background_tasks.add_task(process_material, material_id)
                logger.info(f"URL material created: {material_id}")

            # FILE MATERIAL
            if file:
                logger.info("Uploading document material")

                topic_folder = os.path.join(UPLOAD_DIR, f"topic_{topic_id}")
                os.makedirs(topic_folder, exist_ok=True)

                unique_filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join(topic_folder, unique_filename)

                with open(file_path, "wb") as f:
                    f.write(await file.read())

                doc = MaterialCreate(
                    user_id=user_id,
                    topic_id=topic_id,
                    material_type="document",
                    title=file.filename,
                    file_name=file.filename,
                    file_path=file_path
                )

                doc_dict = doc.model_dump()
                doc_dict["created_at"] = doc_dict.get("created_at", datetime.utcnow())
                doc_dict["updated_at"] = doc_dict.get("updated_at", datetime.utcnow())

                result = await mongodb.db.materials.insert_one(doc_dict)
                material_id = str(result.inserted_id)
                materials_created.append(material_id)

                background_tasks.add_task(process_material, material_id)
                logger.info(f"Document material created: {material_id}")

            return {
                "message": "Materials uploaded successfully",
                "material_ids": materials_created
            }

        except Exception as e:
            logger.error(f"Error uploading material: {str(e)}")
            raise Exception("Failed to upload material")
        
    @staticmethod
    async def get_materials_by_topic(topic_id: str, user_id: str):
        try:
            materials = await mongodb.db.materials.find({"topic_id": topic_id, "user_id": user_id}).to_list(length=100)

            result = []
            for material in materials:
                material_type = material.get("material_type")
                file_url = None
                source_url = None
                text_preview = None

                if material_type == "document":
                       file_url = f"/uploads/topic_{topic_id}/{material.get('file_name')}"
                elif material_type == "url":
                    source_url = material.get("source_url")
                elif material_type == "text":
                    text_preview = material.get("content")[:100] + "..." if len(material.get("content")) > 100 else material.get("content")
                 
                material_data = {
                "_id": str(material["_id"]),
                "title": material.get("title"),
                "material_type": material.get("material_type"),
                "processing_status": material.get("processing_status"),
                "file_url": file_url,
                "source_url": source_url,
                "text_preview": text_preview,
                "chunks_count": material.get("chunks_count", 0),
                "mcq_count": material.get("mcq_count", 0),
                "flashcard_count": material.get("flashcard_count", 0),
                "summary": material.get("summary"),
                "created_at": material.get("created_at"),
                "updated_at": material.get("updated_at"),
            } 
                result.append(material_data)
            return result

        except Exception as e:
            logger.error(f"Error fetching materials: {str(e)}")
            raise Exception("Failed to fetch materials")