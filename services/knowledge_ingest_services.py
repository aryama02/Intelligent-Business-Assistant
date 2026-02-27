import json
import re
import ollama

from db import get_database, get_redis, clear_old_cache, bump_kb_version
from services.embedding_services import generate_embedding
from zilliz_db import insert_customer_embedding


def _extract_json_array(text: str):
    """
    Best-effort extraction of a JSON array from model output.
    """
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON array found in model output")
    payload = text[start : end + 1]
    return json.loads(payload)


def _normalize_question(q: str) -> str:
    q = re.sub(r"\s+", " ", q.strip())
    q = q.rstrip("?").strip()
    return q + "?" if q else q


async def ingest_company_knowledge_service(company_name: str, text: str, max_pairs: int = 18):
    """
    Turns a large blob of company policy/info text into multiple Q&A pairs,
    stores them as chat configs for this company, generates embeddings, and
    invalidates Redis caches.
    """
    if not text or len(text.strip()) < 50:
        return {"success": False, "error": "Please provide a longer company text (at least ~50 characters)."}

    max_pairs = int(max_pairs or 18)
    if max_pairs < 5:
        max_pairs = 5
    if max_pairs > 40:
        max_pairs = 40

    system_prompt = (
        "You convert company knowledge into a helpful Q&A knowledge base.\n"
        "Given a large text blob about a company (policies, pricing, hours, shipping, refunds, support, etc),\n"
        f"generate up to {max_pairs} high-signal Q&A pairs.\n"
        "Return ONLY valid JSON as an array of objects with EXACT keys: question, answer.\n"
        "No markdown. No extra keys. No explanations.\n"
        "Questions should be concise and customer-facing. Answers should be short and specific.\n"
    )

    model_out = ollama.chat(
        model="deepseek-r1:8b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
    )

    raw = model_out["message"].content.strip()
    try:
        items = _extract_json_array(raw)
    except Exception:
        return {
            "success": False,
            "error": "AI output could not be parsed as JSON. Try again with a slightly shorter/cleaner text.",
            "raw_preview": raw[:600],
        }

    if not isinstance(items, list) or len(items) == 0:
        return {"success": False, "error": "No Q&A pairs generated. Try again."}

    dedup = set()
    docs = []
    for it in items:
        if not isinstance(it, dict):
            continue
        q = _normalize_question(str(it.get("question", "")).strip())
        a = str(it.get("answer", "")).strip()
        if not q or not a:
            continue
        key = q.lower()
        if key in dedup:
            continue
        dedup.add(key)
        docs.append({"company_name": company_name, "question": q, "answer": a})

    if len(docs) == 0:
        return {"success": False, "error": "Generated content was empty after validation. Try again."}

    db_instance = get_database()
    chat_collection = db_instance.get_collection("chat_configs")

    insert_result = await chat_collection.insert_many(docs)
    inserted_ids = [str(_id) for _id in insert_result.inserted_ids]

    # Generate embeddings for search/smart context
    for mongodb_id, doc in zip(inserted_ids, docs):
        text_for_embedding = f"Question: {doc['question']} Answer: {doc['answer']}"
        embedding = generate_embedding(text_for_embedding)
        insert_customer_embedding(
            mongodb_id=mongodb_id,
            customer_name=company_name,
            customer_data=text_for_embedding,
            embedding=embedding,
        )

    # Invalidate caches:
    # - chat configs cache-aside key
    # - bump kb version so chat response caches naturally rotate
    redis_client = get_redis()
    if redis_client:
        await clear_old_cache(f"chat_configs:{company_name}")
        await bump_kb_version(company_name)

    preview = [{"question": d["question"], "answer": d["answer"]} for d in docs[: min(6, len(docs))]]
    return {
        "success": True,
        "company_name": company_name,
        "created_count": len(docs),
        "inserted_ids": inserted_ids,
        "preview": preview,
    }

