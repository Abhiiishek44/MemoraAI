from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def get_embedding(text: str):
    try:
        response = client.models.embed_text(
            model="embedding-001",
            text=text
        )

        return response.embedding.values

    except Exception as e:
        print("Embedding error:", e)
        return []