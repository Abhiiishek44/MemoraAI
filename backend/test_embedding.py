import asyncio
from modules.pipeline.embedding import get_embedding

async def main():
    emb = await get_embedding("test")
    print(emb[:5] if emb else "Empty")
    
asyncio.run(main())
