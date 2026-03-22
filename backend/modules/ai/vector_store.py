import uuid
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from modules.ai.embedding import get_embedding

collection_name = "materials"
client = QdrantClient("localhost", port=6333)


# Ensure collection exists
def ensure_collection():
    collections = client.get_collections().collections
    names = [c.name for c in collections]

    if collection_name not in names:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=rest.VectorParams(
                size=768,  # IMPORTANT: match embedding size
                distance=rest.Distance.COSINE
            ),
            on_disk_payload=True
        )
        print("Qdrant collection created")
    else:
        print("Qdrant collection already exists")


# Store vectors in Qdrant
async def store_vector(chunks, material_id, topic_id):
    ensure_collection()
    points = []

    for i, chunk in enumerate(chunks):
        try:
            embedding = await get_embedding(chunk["text"])

            # Safety check
            if not embedding:
                print("Embedding failed for chunk:", i)
                continue

            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{material_id}_{i}"))

            point = rest.PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "material_id": material_id,
                    "topic_id": topic_id,
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"]
                }
            )

            points.append(point)

        except Exception as e:
            print("Error generating embedding:", e)

    if points:
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"Stored {len(points)} vectors in Qdrant")
    else:
        print("No vectors to store")


# Delete old vectors for a material
def delete_vector(material_id):
    ensure_collection()

    client.delete(
        collection_name=collection_name,
        points_selector=rest.Filter(
            must=[
                rest.FieldCondition(
                    key="material_id",
                    match=rest.MatchValue(value=material_id)
                )
            ]
        )
    )

    print(f"Deleted vectors for material: {material_id}")