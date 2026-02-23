from db import get_database, get_redis, clear_old_cache, bump_kb_version, flush_redis
from model.schema import userRegistrationRequest, chatModel
from zilliz_db import insert_customer_embedding, update_customer_embedding
from services.embedding_services import generate_embedding
from bson import ObjectId



async def register_user_service(request: userRegistrationRequest):
    db_instance = get_database()
    users_collection = db_instance.get_collection("users")
    newUser = request.dict()
    newUser["isSubscribed"] = False
    result = await users_collection.insert_one(newUser)
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


async def chat_config_service(chat_data: chatModel, decoded_payload: dict):
    company_name = decoded_payload["company_name"]
    db_instance = get_database()
    chat_collection = db_instance.get_collection("chat_configs")
    data = {
        "company_name": company_name,
        "question": chat_data.question,
        "answer": chat_data.answer,
    }
    
    # 1. Store in MongoDB
    result = await chat_collection.insert_one(data)
    mongodb_id = str(result.inserted_id)
    
    # 2. Generate embedding
    text_for_embedding = f"Question: {chat_data.question} Answer: {chat_data.answer}"
    embedding = generate_embedding(text_for_embedding)
    
    # 3. Store in Zilliz
    insert_customer_embedding(
        mongodb_id=mongodb_id,
        customer_name=company_name,
        customer_data=text_for_embedding,
        embedding=embedding
    )

    # 4. Invalidate any cached chat configs for this company
    redis_client = get_redis()
    if redis_client:
        cache_key = f"chat_configs:{company_name}"
        await clear_old_cache(cache_key)
        await bump_kb_version(company_name)
    
    return {
        "message": "Chat configuration saved successfully",
        "config_id": mongodb_id,
    }

async def update_chat_config_service(config_id: str, chat_data: chatModel, decoded_payload: dict ):
    company_name = decoded_payload["company_name"]
    db_instance = get_database()
    chat_collection = db_instance.get_collection("chat_configs")
    
    # 1. Update in MongoDB
    result = await chat_collection.update_one(
        {"_id": ObjectId(config_id)},
        {"$set": {
            "question": chat_data.question,
            "answer": chat_data.answer,
        }}
    )
    
    if result.matched_count == 0:
        return {"error": "Configuration not found"}
    
    # 2. Generate new embedding
    text_for_embedding = f"Question: {chat_data.question} Answer: {chat_data.answer}"
    embedding = generate_embedding(text_for_embedding)
    
    # 3. Update in Zilliz
    update_customer_embedding(
        mongodb_id=config_id,
        customer_name=company_name,
        customer_data=text_for_embedding,
        embedding=embedding
    )
    # Invalidate only this company's chat config cache instead of flushing all Redis
    redis_client = get_redis()
    if redis_client:
        cache_key = f"chat_configs:{company_name}"
        await clear_old_cache(cache_key)
        await bump_kb_version(company_name)
    
    return {
        "message": "Chat configuration updated successfully",
        "config_id": config_id,
    }


async def get_chat_config_service(company_name: str):
    """
    Retrieve chat configs for a company using Redis cache-aside strategy.
    - On cache hit: return cached configs from Redis.
    - On cache miss: query MongoDB, shape the data, then cache it in Redis.
    """
    cache_key = f"chat_configs:{company_name}"

    # Try Redis first
    redis_client = get_redis()
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                import json
                return json.loads(cached)
        except Exception as e:
            print(f"Redis error while reading chat configs: {e}")

    # Fallback to MongoDB on cache miss or Redis error
    db_instance = get_database()
    chat_collection_cursor = db_instance.get_collection("chat_configs").find(
        {"company_name": company_name}
    )
    configs = await chat_collection_cursor.to_list(length=100)
    for config in configs:
        config["_id"] = str(config["_id"])

    response = {"chat_configs": configs}

    # Populate Redis cache for next time
    if redis_client:
        try:
            import json
            await redis_client.set(cache_key, json.dumps(response))
        except Exception as e:
            print(f"Redis error while caching chat configs: {e}")

    return response


async def getProfileService(decoded_payload: dict):
    user = (
        await get_database()
        .get_collection("users")
        .find_one({"email": decoded_payload["email"]})
    )

    apiKey = (
        await get_database()
        .get_collection("subscriptions")
        .find_one({"user_email": decoded_payload["email"]})
    )
    
    if not user:
        return {"message": "User not found"}
    
    api_key = "Not set"
    if apiKey:
        apiKey["_id"] = str(apiKey["_id"]) 
        api_key = apiKey.get("api_key", "Not set")
        
    user["_id"] = str(user["_id"])
    
    return {"user": user, "api_key": api_key}