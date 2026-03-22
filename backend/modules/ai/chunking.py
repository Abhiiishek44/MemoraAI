def chunk_text(text, chunk_size=5, overlap=1):
    import re
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    chunk_id = 0

    for i in range(0, len(sentences), chunk_size - overlap):
        chunk = " ".join(sentences[i:i + chunk_size])
        chunks.append({
            "text": chunk,
            "chunk_index": chunk_id
        })
        chunk_id += 1

    return chunks