def chunk_text(text, chunk_size=800, overlap=120):
    words = text.split()
    if not words:
        return []

    if overlap >= chunk_size:
        overlap = max(0, chunk_size // 4)

    chunks = []
    chunk_id = 0
    step = max(1, chunk_size - overlap)

    for i in range(0, len(words), step):
        chunk_words = words[i:i + chunk_size]
        if not chunk_words:
            continue
        chunk = " ".join(chunk_words).strip()
        if not chunk:
            continue
        chunks.append({
            "text": chunk,
            "chunk_index": chunk_id
        })
        chunk_id += 1

    return chunks