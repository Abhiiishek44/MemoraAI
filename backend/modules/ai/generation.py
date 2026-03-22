from openai import AsyncOpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_summary(text: str) -> str:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes educational content. Provide a concise but comprehensive summary."},
                {"role": "user", "content": f"Summarize the following text:\n\n{text[:10000]}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Summary generation failed."

async def generate_mcqs(text: str) -> list:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant. Generate 3 multiple choice questions based on the provided text. Return in JSON format as { \"mcqs\": [ {\"question\": \"...\", \"options\": [\"a\", \"b\", \"c\", \"d\"], \"correct_answer\": \"a\", \"explanation\": \"...\"} ] }."},
                {"role": "user", "content": f"Text to use for MCQs:\n\n{text[:5000]}"}
            ]
        )
        content = json.loads(response.choices[0].message.content)
        return content.get("mcqs", [])
    except Exception as e:
        print(f"Error generating MCQs: {str(e)}")
        return []

async def generate_flashcards(text: str) -> list:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": "You are an educational assistant. Generate 5 flashcards from the text. Return in JSON format as { \"flashcards\": [ {\"front\": \"...Q...\", \"back\": \"...A...\"} ] }."},
                {"role": "user", "content": f"Text for flashcards:\n\n{text[:5000]}"}
            ]
        )
        content = json.loads(response.choices[0].message.content)
        return content.get("flashcards", [])
    except Exception as e:
        print(f"Error generating flashcards: {str(e)}")
        return []
