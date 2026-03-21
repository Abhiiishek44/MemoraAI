from datetime import datetime
from tkinter.filedialog import test
from shared.config.database import mongodb
from asyncio.log import logger


async def process_material_pipeline(material_id: str):
    try:
        logger.info(f"Starting processing pipeline for material: {material_id}")
        material = await mongodb.materials.find_one({"_id": material_id})

        if not material:
            logger.error("Material not found")
            return
        
        # Update material status to processing
        await mongodb.materials.update_one(
            {"_id": material_id},
            {"$set": {"processing_status": "processing", "updated_at": datetime.utcnow()}}
        )   

        if material["material_type"] == "text":
            text = material["content"]
        
        elif material["material_type"] == "url":
            text = extract_text_from_url(material["source_url"])

        elif material["material_type"] == "document":
            text = extract_text_from_document(material["file_path"])
        else:
            logger.error("Unknown material type")
            await mongodb.materials.update_one(
                {"_id": material_id},
                {"$set": {"processing_status": "failed", "error_message": "Unknown material type", "updated_at": datetime.utcnow()}}
            )
            return
        
        await mongodb.materials.update_one(
            {"_id": material_id},
            {"$set": {"extracted_text": text, "processing_status": "completed", "updated_at": datetime.utcnow()}}
        )
        
        chunks = chunk_text(text)

        delete_vector_embeddings(material_id)

        await store_vector(chunks, material_id, str(material["topic_id"]))

        # generate summary, mcqs, flashcards
        summary =await generate_summary(text)
        mcqs = await generate_mcqs(text)
        flashcards =await generate_flashcards(text)

        await mongodb.summaries.insert_one({
            "material_id": material_id,
            "topic_id": material["topic_id"],
            "summary": summary,
            "created_at": datetime.utcnow(),
        })  

        if mcqs:
            for mcq in mcqs:
                mcq["material_id"] = material_id
                mcq["topic_id"] = material["topic_id"]
                mcq["created_at"] = datetime.utcnow()
            await mongodb.mcqs.insert_many(mcqs)

        if flashcards:
            for flashcard in flashcards:
                flashcard["material_id"] = material_id
                flashcard["topic_id"] = material["topic_id"]
                flashcard["created_at"] = datetime.utcnow()
            await mongodb.flashcards.insert_many(flashcards)

        await mongodb.materials.update_one(
            {"_id": material_id},
            {"$set": {
                    "status": "completed",
                    "chunks_count": len(chunks),
                    "summary_generated": True,
                    "mcq_generated": True,
                    "flashcard_generated": True,
                    "mcq_count": len(mcqs),
                    "flashcard_count": len(flashcards),
                    "updated_at": datetime.utcnow()
            }}
        )
        logger.info(f"Completed processing pipeline for material: {material_id}")

    except Exception as e:
            logger.error(f"Processing failed for material {material_id}: {str(e)}")
            await mongodb.materials.update_one(
                {"_id": material_id},
                {"$set": {"processing_status": "failed", "error_message": str(e), "updated_at": datetime.utcnow()}}
            )



    