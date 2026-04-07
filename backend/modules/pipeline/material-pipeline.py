from datetime import datetime
from bson import ObjectId
from shared.config.database import mongodb
from shared.utils.logger import logger
from modules.pipeline.text_extraction import TextExtractor
from modules.pipeline.chunking import chunk_text
from modules.pipeline.embedding import get_embedding
from modules.pipeline.vector_store import store_vector, delete_vector
from modules.pipeline.generation import generate_summary, generate_mcqs, generate_flashcards


async def process_material_pipeline(material_id: str):
    pipeline_errors = []
    try:
        logger.info("PIPELINE STARTED | Material ID: %s", material_id)

        material = await mongodb.db.materials.find_one({"_id": ObjectId(material_id)})

        if not material:
            logger.error("Material not found")
            return

        logger.info("Step 1: Updating status → processing")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {"processing_status": "processing", "updated_at": datetime.utcnow()}}
        )

        logger.info("Step 2: Extracting text | Type: %s", material["material_type"])

        if material["material_type"] == "text":
            text = material.get("content", "")

        elif material["material_type"] == "url":
            text = await TextExtractor.extract_text_from_url(material["source_url"])

        elif material["material_type"] == "document":
            text = await TextExtractor.extract_text_from_document(material["file_path"])

        else:
            raise ValueError("Unknown material type")

        if not text or len(text.strip()) == 0:
            raise ValueError("No text extracted")

        logger.info("Text extracted | Length: %s characters", len(text))

        logger.info("Step 3: Saving extracted text")
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {"extracted_text": text, "processing_status": "extracted"}}
        )

        logger.info("Step 4: Chunking text")
        chunks = chunk_text(text)
        logger.info("Chunks created: %s", len(chunks))

        for chunk in chunks:
            chunk["topic_id"] = material["topic_id"]

        logger.info("Step 5: Deleting old vectors from Qdrant")
        try:
            delete_vector(material_id)
        except Exception as exc:
            pipeline_errors.append({"step": "delete_vectors", "error": str(exc)})
            logger.exception("Failed to delete old vectors: %s", exc)

        logger.info("Step 6: Generating embeddings and storing in Qdrant")
        embeddings = []
        for chunk in chunks:
            embedding = await get_embedding(chunk.get("text", ""))
            embeddings.append(embedding)

        vector_result = await store_vector(material_id, chunks, embeddings)

        if vector_result.get("failed"):
            pipeline_errors.append({
                "step": "embeddings",
                "failed": vector_result.get("failed"),
            })

        logger.info("Step 7: Generating Summary, MCQs, Flashcards")

        summary = ""
        mcqs = []
        flashcards = []

        try:
            summary = await generate_summary(text)
        except Exception as exc:
            pipeline_errors.append({"step": "summary", "error": str(exc)})
            logger.error("Failed to generate summary: %s", exc)

        try:
            mcqs = await generate_mcqs(text)
        except Exception as exc:
            pipeline_errors.append({"step": "mcqs", "error": str(exc)})
            logger.error("Failed to generate MCQs: %s", exc)

        try:
            flashcards = await generate_flashcards(text)
        except Exception as exc:
            pipeline_errors.append({"step": "flashcards", "error": str(exc)})
            logger.error("Failed to generate flashcards: %s", exc)

        if summary:
            logger.info("Step 8: Saving summary")
            await mongodb.db.summaries.insert_one({
                "material_id": material_id,
                "topic_id": material["topic_id"],
                "summary": summary,
                "created_at": datetime.utcnow(),
            })

        if mcqs:
            logger.info("Saving MCQs | Count: %s", len(mcqs))
            for mcq in mcqs:
                mcq["material_id"] = material_id
                mcq["topic_id"] = material["topic_id"]
                mcq["created_at"] = datetime.utcnow()
            await mongodb.db.mcqs.insert_many(mcqs)

        if flashcards:
            logger.info("Saving Flashcards | Count: %s", len(flashcards))
            for flashcard in flashcards:
                flashcard["material_id"] = material_id
                flashcard["topic_id"] = material["topic_id"]
                flashcard["created_at"] = datetime.utcnow()
            await mongodb.db.flashcards.insert_many(flashcards)

        logger.info("Step 11: Updating final status")

        status = "completed"
        if not summary or not mcqs or not flashcards or vector_result.get("failed"):
            status = "partial_success"

        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {
                "processing_status": status,
                "chunks_count": len(chunks),
                "vectors_stored": vector_result.get("stored", 0),
                "vectors_failed": vector_result.get("failed", 0),
                "summary_generated": bool(summary),
                "mcq_generated": bool(mcqs),
                "flashcard_generated": bool(flashcards),
                "mcq_count": len(mcqs) if mcqs else 0,
                "flashcard_count": len(flashcards) if flashcards else 0,
                "pipeline_errors": pipeline_errors,
                "updated_at": datetime.utcnow()
            }}
        )

        logger.info("PIPELINE COMPLETED | Material ID: %s", material_id)

    except Exception as exc:
        logger.error("PIPELINE FAILED | Material ID: %s | Error: %s", material_id, exc)
        await mongodb.db.materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": {
                "processing_status": "failed",
                "error_message": str(exc),
                "pipeline_errors": pipeline_errors,
                "updated_at": datetime.utcnow()
            }}
        )