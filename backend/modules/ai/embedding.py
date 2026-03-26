import asyncio
import os
from typing import List, Optional

from dotenv import load_dotenv
from google import genai

from shared.utils.logger import logger

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
EMBEDDING_DIM = int(os.getenv("GEMINI_EMBEDDING_DIM", "3072"))
MAX_EMBEDDING_CHARS = int(os.getenv("GEMINI_EMBEDDING_MAX_CHARS", "8000"))
EMBEDDING_MAX_RETRIES = int(os.getenv("GEMINI_EMBEDDING_MAX_RETRIES", "3"))
EMBEDDING_RETRY_BACKOFF = float(os.getenv("GEMINI_EMBEDDING_RETRY_BACKOFF", "1.5"))


def _sanitize_text(text: str) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) > MAX_EMBEDDING_CHARS:
        return cleaned[:MAX_EMBEDDING_CHARS]
    return cleaned


def _is_valid_embedding(embedding: List[float]) -> bool:
    if not embedding or len(embedding) != EMBEDDING_DIM:
        return False
    if any(value is None for value in embedding):
        return False
    if all(value == 0 for value in embedding):
        return False
    return True

async def get_embedding(text: str) -> Optional[List[float]]:
    if not text or not text.strip():
        logger.warning("Embedding skipped: empty text")
        return None

    cleaned_text = _sanitize_text(text)

    for attempt in range(1, EMBEDDING_MAX_RETRIES + 1):
        try:
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=cleaned_text
            )

            embedding = response.embeddings[0].values
            if _is_valid_embedding(embedding):
                return embedding

            logger.error(
                "Invalid embedding received | size=%s | expected=%s | attempt=%s",
                len(embedding) if embedding else 0,
                EMBEDDING_DIM,
                attempt,
            )
        except Exception as exc:
            logger.warning("Embedding error | attempt=%s | error=%s", attempt, exc)

        if attempt < EMBEDDING_MAX_RETRIES:
            await asyncio.sleep(EMBEDDING_RETRY_BACKOFF ** attempt)

    logger.error("Embedding failed after retries")
    return None