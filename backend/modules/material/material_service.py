import os
import uuid
from datetime import datetime
from modules.material.material_schema import MaterialCreate, MaterialResponse
from shared.config.database import mongodb
from modules.pipeline.ai_background_pipline import process_material_pipeline as process_material
from shared.utils.logger import logger
from bson import ObjectId
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
    
    @staticmethod
    async def delete_material(material_id: str):
        try:
            material = await mongodb.db.materials.find_one({"_id": ObjectId(material_id)})

            if not material:
                raise Exception("Material not found")

            if material.get("material_type") == "document":
                file_path = material.get("file_path")
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)

            await mongodb.db.materials.delete_one({"_id": ObjectId(material_id)})
            return {"message": "Material deleted successfully"}

        except Exception as e:
            logger.error(f"Error deleting material: {str(e)}")
            raise Exception("Failed to delete material")

    @staticmethod
    async def get_material(material_id: str):
        try:
            if not ObjectId.is_valid(material_id):
                raise Exception("Invalid material id")

            material = await mongodb.db.materials.find_one({"_id": ObjectId(material_id)})
            if not material:
                raise Exception("Material not found")

            material_type = material.get("material_type")
            file_url = None
            source_url = None
            text_preview = None

            if material_type == "document":
                file_url = f"/uploads/topic_{material.get('topic_id')}/{material.get('file_name')}"
            elif material_type == "url":
                source_url = material.get("source_url")
            elif material_type == "text":
                content = material.get("content") or ""
                text_preview = content[:100] + "..." if len(content) > 100 else content

            return {
                "_id": str(material["_id"]),
                "title": material.get("title"),
                "material_type": material_type,
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
                "error_message": material.get("error_message"),
            }
        except Exception as e:
            logger.error(f"Error fetching material: {str(e)}")
            raise Exception("Failed to fetch material")

    @staticmethod
    async def get_status(material_id: str):
        try:
            if not ObjectId.is_valid(material_id):
                raise Exception("Invalid material id")

            material = await mongodb.db.materials.find_one(
                {"_id": ObjectId(material_id)},
                {
                    "processing_status": 1,
                    "error_message": 1,
                    "chunks_count": 1,
                    "mcq_count": 1,
                    "flashcard_count": 1,
                    "updated_at": 1,
                },
            )

            if not material:
                raise Exception("Material not found")

            return {
                "material_id": material_id,
                "processing_status": material.get("processing_status"),
                "error_message": material.get("error_message"),
                "chunks_count": material.get("chunks_count", 0),
                "mcq_count": material.get("mcq_count", 0),
                "flashcard_count": material.get("flashcard_count", 0),
                "updated_at": material.get("updated_at"),
            }
        except Exception as e:
            logger.error(f"Error fetching material status: {str(e)}")
            raise Exception("Failed to fetch material status")

    @staticmethod
    async def reprocess_material(material_id: str, background_tasks):
        try:
            if not ObjectId.is_valid(material_id):
                raise Exception("Invalid material id")

            material = await mongodb.db.materials.find_one({"_id": ObjectId(material_id)})
            if not material:
                raise Exception("Material not found")

            await mongodb.db.materials.update_one(
                {"_id": ObjectId(material_id)},
                {
                    "$set": {
                        "processing_status": "processing",
                        "error_message": None,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )

            background_tasks.add_task(process_material, material_id)

            return {
                "message": "Material reprocessing started",
                "material_id": material_id,
                "processing_status": "processing",
            }
        except Exception as e:
            logger.error(f"Error reprocessing material: {str(e)}")
            raise Exception("Failed to reprocess material")
        