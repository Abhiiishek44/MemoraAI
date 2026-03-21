import os
import uuid
from modules.material.material_schema import MaterialCreate
from shared.config.database import mongodb
from app.services.ai_background_tasks import process_material
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

                result = await mongodb.materials.insert_one(doc)
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

                result = await mongodb.materials.insert_one(doc)
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

                result = await mongodb.materials.insert_one(doc)
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