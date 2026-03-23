from google import genai
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

response = client.models.embed_content(
    model="text-embedding-004",
    contents=["hello world"]
)
print(len(response.embeddings[0].values))
