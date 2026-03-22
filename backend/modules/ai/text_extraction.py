import httpx
from bs4 import BeautifulSoup
import fitz

class TextExtractor:
    @staticmethod
    async def extract_text_from_url(url):
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            return soup.get_text()

    @staticmethod
    async def extract_text_from_document(file_path):
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        return text