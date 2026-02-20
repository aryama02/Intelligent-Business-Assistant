from db import get_database
from model.schema import userRegistrationRequest, chatModel
from zilliz_db import insert_customer_embedding
from services.embedding_services import generate_embedding



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
    
    return {
        "message": "Chat configuration saved successfully",
        "config_id": mongodb_id,
    }


async def get_chat_config_service(company_name: str):
    db_instance = get_database()
    chat_collection = db_instance.get_collection("chat_configs").find(
        {"company_name": company_name}
    )
    configs = await chat_collection.to_list(length=100)
    for config in configs:
        config["_id"] = str(config["_id"])
    return {"chat_configs": configs}


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