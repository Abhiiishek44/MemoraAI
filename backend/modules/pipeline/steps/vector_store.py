import uuid
from typing import Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

from modules.pipeline.embedding import EMBEDDING_DIM
from shared.utils.logger import logger

collection_name = "materials"
client = QdrantClient("localhost", port=6333)


def ensure_collection() -> None:
    collections = client.get_collections().collections
    names = [c.name for c in collections]

    if collection_name not in names:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=rest.VectorParams(
                size=EMBEDDING_DIM,
                distance=rest.Distance.COSINE
            ),
            on_disk_payload=True
        )
        logger.info("Qdrant collection created")
        return

    collection_info = client.get_collection(collection_name)
    vector_size = collection_info.config.params.vectors.size
    if vector_size != EMBEDDING_DIM:
        logger.warning(
            "Qdrant collection vector size mismatch: %s != %s. Recreating collection.",
            vector_size,
            EMBEDDING_DIM,
        )
        client.delete_collection(collection_name=collection_name)
        client.create_collection(
            collection_name=collection_name,
            vectors_config=rest.VectorParams(
                size=EMBEDDING_DIM,
                distance=rest.Distance.COSINE,
            ),
            on_disk_payload=True,
        )
        logger.info("Qdrant collection recreated with size %s", EMBEDDING_DIM)
    else:
        logger.info("Qdrant collection already exists")


async def store_vector(material_id: str, chunks: List[Dict], embeddings: List[Optional[List[float]]]) -> Dict:
    try:
        ensure_collection()
    except Exception as exc:
        logger.exception("Failed to ensure Qdrant collection: %s", exc)
        return {
            "stored": 0,
            "failed": len(chunks),
            "failures": [{"chunk_index": chunk.get("chunk_index"), "reason": "collection_error"} for chunk in chunks],
        }

    points = []
    failures = []

    if len(embeddings) != len(chunks):
        logger.warning(
            "Embeddings count mismatch | chunks=%s embeddings=%s",
            len(chunks),
            len(embeddings),
        )

    for i, chunk in enumerate(chunks):
        embedding = embeddings[i] if i < len(embeddings) else None

        if not embedding:
            failures.append({"chunk_index": chunk.get("chunk_index"), "reason": "empty_embedding"})
            continue

        if len(embedding) != EMBEDDING_DIM:
            failures.append({
                "chunk_index": chunk.get("chunk_index"),
                "reason": "invalid_embedding_size",
                "size": len(embedding),
            })
            continue

        if all(value == 0 for value in embedding):
            failures.append({"chunk_index": chunk.get("chunk_index"), "reason": "zero_embedding"})
            continue

        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{material_id}_{i}"))
        payload = {
            "material_id": material_id,
            "chunk_index": chunk.get("chunk_index"),
            "text": chunk.get("text", "")
        }
        if "topic_id" in chunk:
            payload["topic_id"] = chunk["topic_id"]

        points.append(
            rest.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )
        )

    if points:
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        logger.info("Stored %s vectors in Qdrant", len(points))
    else:
        logger.warning("No vectors to store")

    return {
        "stored": len(points),
        "failed": len(failures),
        "failures": failures,
    }


def delete_vector(material_id: str) -> None:
    collections = client.get_collections().collections
    names = [c.name for c in collections]
    if collection_name not in names:
        logger.info("Qdrant collection not found. Skipping delete for material: %s", material_id)
        return

    client.delete(
        collection_name=collection_name,
        points_selector=rest.FilterSelector(
            filter=rest.Filter(
                must=[
                    rest.FieldCondition(
                        key="material_id",
                        match=rest.MatchValue(value=material_id)
                    )
                ]
            )
        )
    )

    logger.info("Deleted vectors for material: %s", material_id)