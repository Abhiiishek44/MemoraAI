from datetime import datetime
from bson import ObjectId
from shared.config.database import mongodb
from shared.utils.logger import logger
from modules.ai.text_extraction import TextExtractor
from modules.ai.chunking import chunk_text
from modules.ai.vector_store import store_vector, delete_vector
from modules.ai.generation import generate_summary, generate_mcqs, generate_flashcards


async def process_material_pipeline(material_id: str):
    try:
        logger.info(f"PIPELINE STARTED | Material ID: {material_id}")

        material = await mongodb.db.materials.find_one({"_id": ObjectId(material_id)})

        if not material:
            logger.error("Material not found")
            return

        # Step 1: Processing started
        logger.info("Step 1: Updating status → processing")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {"processing_status": "processing", "updated_at": datetime.utcnow()}}
        )

        # Step 2: Extract text
        logger.info(f"Step 2: Extracting text | Type: {material['material_type']}")

        if material["material_type"] == "text":
            text = material["content"]

        elif material["material_type"] == "url":
            text = await TextExtractor.extract_text_from_url(material["source_url"])

        elif material["material_type"] == "document":
            text = await TextExtractor.extract_text_from_document(material["file_path"])

        else:
            logger.error("Unknown material type")
            return

        if not text or len(text.strip()) == 0:
            raise Exception("No text extracted")

        logger.info(f"Text extracted | Length: {len(text)} characters")

        # Step 3: Save extracted text
        logger.info("Step 3: Saving extracted text")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {"extracted_text": text, "processing_status": "extracted"}}
        )

        # Step 4: Chunking
        logger.info("Step 4: Chunking text")
        chunks = chunk_text(text)
        logger.info(f"Chunks created: {len(chunks)}")

        # Step 5: Delete old vectors
        logger.info("Step 5: Deleting old vectors from Qdrant")
        delete_vector(material_id)

        # Step 6: Store embeddings
        logger.info("Step 6: Generating embeddings and storing in Qdrant")
        await store_vector(chunks, material_id, str(material["topic_id"]))

        # Step 7: Generate AI content
        logger.info("Step 7: Generating Summary, MCQs, Flashcards")
        # summary = await generate_summary(text)
        # mcqs = await generate_mcqs(text)
        # flashcards = await generate_flashcards(text)

        # Step 8: Save summary
        logger.info("Step 8: Saving summary")
        await mongodb.db.summaries.insert_one({
            "material_id": material_id,
            "topic_id": material["topic_id"],
            "summary": summary,
            "created_at": datetime.utcnow(),
        })

        # Step 9: Save MCQs
        if mcqs:
            logger.info(f"Saving MCQs | Count: {len(mcqs)}")
            for mcq in mcqs:
                mcq["material_id"] = material_id
                mcq["topic_id"] = material["topic_id"]
                mcq["created_at"] = datetime.utcnow()
            await mongodb.db.mcqs.insert_many(mcqs)

        # Step 10: Save Flashcards
        if flashcards:
            logger.info(f"Saving Flashcards | Count: {len(flashcards)}")
            for flashcard in flashcards:
                flashcard["material_id"] = material_id
                flashcard["topic_id"] = material["topic_id"]
                flashcard["created_at"] = datetime.utcnow()
            await mongodb.db.flashcards.insert_many(flashcards)

        # Step 11: Completed
        logger.info("Step 11: Updating final status → completed")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {
                "processing_status": "completed",
                "chunks_count": len(chunks),
                "summary_generated": True,
                "mcq_generated": True,
                "flashcard_generated": True,
                "mcq_count": len(mcqs),
                "flashcard_count": len(flashcards),
                "updated_at": datetime.utcnow()
            }}
        )

        logger.info(f"PIPELINE COMPLETED | Material ID: {material_id}")

    except Exception as e:
        logger.error(f"PIPELINE FAILED | Material ID: {material_id} | Error: {str(e)}")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {
                "processing_status": "failed",
                "error_message": str(e),
                "updated_at": datetime.utcnow()
            }}
        )