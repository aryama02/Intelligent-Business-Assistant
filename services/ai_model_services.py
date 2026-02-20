from db import get_database, get_redis
from helpers import format_company_info, get_knowledge_base_string
from model.schema import chatRequest
from services.search_services import search_customer_service
import ollama
from datetime import datetime
import json
import hashlib

async def chat_endpoint_service(request: chatRequest, api: str):
    if not api:
        return {"error": "API key is required."}

    if not len(api) == 20 or not api.startswith("Ar"):
        return {"error": "Invalid API key"}

    # 1. Check Redis Cache
    redis_client = get_redis()
    cache_key = f"chat:{api}:{hashlib.md5(request.message.encode()).hexdigest()}"
    
    if redis_client:
        try:
            cached_response = await redis_client.get(cache_key)
            if cached_response:
                print(f"Cache Hit for {cache_key}")
                return json.loads(cached_response)
        except Exception as e:
            print(f"Redis Error (get): {e}")

    subscription_collection = get_database().get_collection("subscriptions")
    users_collection = get_database().get_collection("users")
    chat_config_collection = get_database().get_collection("chat_configs")

    is_api_key_exists = await subscription_collection.find_one({"api_key": api})
    print(f"[QUERY] API Key Check: {api} -> {'Found' if is_api_key_exists else 'Not Found'}")

    if not is_api_key_exists:
        return {"error": "Invalid API key not exists."}

    if is_api_key_exists["subscription_end_date"] < datetime.utcnow():
        return {
            "error": "Subscription has ended. Please renew to continue using the API."
        }

    # company info
    company_info = await users_collection.find_one(
        {"email": is_api_key_exists["user_email"]}
    )
    print(f"[QUERY] Company Info Query: {is_api_key_exists['user_email']} -> {'Found' if company_info else 'Not Found'}")

    shaped_company_info = {}
    if company_info:
        company_info["_id"] = str(company_info["_id"])
        shaped_company_info = {
            "company_name": company_info["company_name"],
            "founded": company_info["founded"],
            "location": company_info["location"],
        }

    # chat config
    chat_config_cursor = chat_config_collection.find(
        {"company_name": company_info.get("company_name", "")}
    )
    chat_config = await chat_config_cursor.to_list(length=100)
    print(f"[QUERY] Chat Config Query: {company_info.get('company_name', '')} -> Found {len(chat_config)} items")

    shaped_chat_config = []
    if chat_config:
        for config in chat_config:
            config["_id"] = str(config["_id"])
            new_chat_config = {
                "question": config["question"],
                "answer": config["answer"],
            }
            shaped_chat_config.append(new_chat_config)
            
    knowledge_base_str = get_knowledge_base_string(shaped_chat_config)
    knowledge_about_company = format_company_info(shaped_company_info)

    response = ollama.chat(
        model="deepseek-r1:8b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a concious smart chat assistant."
                    "Always respond in short one or two short sentences"
                    "Never include Asterisks (*) or markdown, or formatting when you respond. "
                    "If user asks a complex question answer shortly first then, ask if they need a longer answer."
                    f"{knowledge_about_company}\n"
                    f"{knowledge_base_str}"
                    "here also answer in plain text , do not use any markdown or formatting in your response."
                ),
            },
            {"role": "user", "content": request.message},
        ],
    )
    
    final_response = {
        "response": response["message"].content,
        "cached": False
    }

    # 2. Store in Redis Cache
    if redis_client:
        try:
            await redis_client.set(cache_key, json.dumps(final_response), ex=3600)
        except Exception as e:
            print(f"Redis Error (set): {e}")

    return final_response

async def chat_smart_endpoint_service(request: chatRequest, api: str):
    """
    Enhanced chat endpoint that uses Zilliz vector search for context retrieval
    with Redis caching for optimized response times.
    """
    if not api:
        return {"error": "API key is required."}

    if not len(api) == 20 or not api.startswith("Ar"):
        return {"error": "Invalid API key"}

    # 1. Check Redis Cache
    redis_client = get_redis()
    cache_key = f"chat_smart:{api}:{hashlib.md5(request.message.encode()).hexdigest()}"
    
    if redis_client:
        try:
            cached_response = await redis_client.get(cache_key)
            if cached_response:
                print(f"Cache Hit for {cache_key}")
                return json.loads(cached_response)
        except Exception as e:
            print(f"Redis Error (get): {e}")

    print(f"Cache Miss for {cache_key}")

    subscription_collection = get_database().get_collection("subscriptions")
    users_collection = get_database().get_collection("users")
    chat_config_collection = get_database().get_collection("chat_configs")

    is_api_key_exists = await subscription_collection.find_one({"api_key": api})

    if not is_api_key_exists:
        return {"error": "Invalid API key not exists."}

    if is_api_key_exists["subscription_end_date"] < datetime.utcnow():
        return {
            "error": "Subscription has ended. Please renew to continue using the API."
        }

    # Company info
    company_info = await users_collection.find_one(
        {"email": is_api_key_exists["user_email"]}
    )

    shaped_company_info = {}
    if company_info:
        company_info["_id"] = str(company_info["_id"])
        shaped_company_info = {
            "company_name": company_info["company_name"],
            "founded": company_info["founded"],
            "location": company_info["location"],
        }

    # Chat config (knowledge base)
    chat_config = await chat_config_collection.find(
        {"company_name": company_info["company_name"]}
    ).to_list(length=100)

    shaped_chat_config = []
    if chat_config:
        for config in chat_config:
            config["_id"] = str(config["_id"])
            new_chat_config = {
                "question": config["question"],
                "answer": config["answer"],
            }
            shaped_chat_config.append(new_chat_config)
    
    # SMART FEATURE: Semantic search for relevant customer data
    search_results = await search_customer_service(request.message, top_k=3)
    
    # Build customer context from vector search results
    customer_context = ""
    if search_results["success"] and len(search_results["results"]) > 0:
        customer_context = "\n\nRelevant Store Information (based on semantic search):\n"
        for idx, result in enumerate(search_results["results"], 1):
            customer = result["customer"]
            similarity = result["similarity_score"]
            customer_context += f"\n{idx}. Store: {customer['name']} (ID: {customer['store_id']})\n"
            customer_context += f"   Description: {customer['description']}\n"
            customer_context += f"   Relevance Score: {similarity:.2f}\n"
    
    knowledge_base_str = get_knowledge_base_string(shaped_chat_config)
    knowledge_about_company = format_company_info(shaped_company_info)

    # Enhanced system prompt with customer context
    system_prompt = (
        "You are a conscious smart chat assistant."
        "Always respond in short one or two short sentences."
        "Never include Asterisks (*) or markdown, or formatting when you respond. "
        "If user asks a complex question answer shortly first then, ask if they need a longer answer."
        f"{knowledge_about_company}\n"
        f"{knowledge_base_str}"
        f"{customer_context}"
        "\n\nIMPORTANT: Use the store information above to provide accurate responses about specific stores."
        "\nAnswer in plain text, do not use any markdown or formatting in your response."
    )

    response = ollama.chat(
        model="deepseek-r1:8b",
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {"role": "user", "content": request.message},
        ],
    )
    
    final_response = {
        "response": response["message"].content,
        "relevant_stores_found": len(search_results.get("results", [])) if search_results["success"] else 0,
        "search_used": True,
        "cached": False
    }

    # 2. Store in Redis Cache
    if redis_client:
        try:
            # We set a flag in the cached version to indicate it's from cache
            cached_version = final_response.copy()
            cached_version["cached"] = True
            await redis_client.set(cache_key, json.dumps(cached_version), ex=3600)
        except Exception as e:
            print(f"Redis Error (set): {e}")

    return final_response
