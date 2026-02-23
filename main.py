from fastapi import Depends, FastAPI, Query
import uvicorn
from services.ai_model_services import chat_endpoint_service, chat_smart_endpoint_service
from model.schema import (
    chatRequest,
    chatModel,
    userLoginRequest,
    userRegistrationRequest,
    CustomerInfoRequest,
    SearchRequest,
)
from services.user_services import (
    getProfileService,
    register_user_service,
    chat_config_service,
    get_chat_config_service,
    update_chat_config_service,
)
from services.customer_services import store_customer_service, get_customer_by_id_service
from services.search_services import search_customer_service
from contextlib import asynccontextmanager
from db import connect_to_mongo, close_mongo_connection, connect_to_redis, close_redis_connection
from zilliz_db import connect_to_zilliz, close_zilliz_connection
from services.auth_services import login_service
from services.payment import subscribe_user_service
from services.api_key import create_api_key_service
from middleware import ContextMiddleware, verify_token


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize databases
    print("Starting up...")
    await connect_to_mongo()
    await connect_to_zilliz()
    await connect_to_redis()
    yield
    # Shutdown: Clean up resources
    await close_redis_connection()
    await close_zilliz_connection()
    await close_mongo_connection()
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

app.add_middleware(ContextMiddleware)


@app.get("/")
def read_root():
    return {"Hello": "World"}


# User Registration
@app.post("/register")
async def register_user_endpoint(request: userRegistrationRequest):
    return await register_user_service(request)


# User login
@app.post("/login")
async def login_user(request: userLoginRequest):
    return await login_service(request)


@app.get("/profile")
@verify_token()
async def get_profile(decoded_payload: dict = None):
    return await getProfileService(decoded_payload)

# subscribe user
@app.post("/subscribe-me")
@verify_token()
async def subscribe_user(decoded_payload: dict = None):
    email = decoded_payload.get("email")
    return await subscribe_user_service(email)

# Generate api key
@app.post("/add-api-key")
@verify_token()
async def add_api_key(decoded_payload: dict = None):
    email = decoded_payload.get("email")
    return await create_api_key_service(email)


# Chat Configuration
@app.get("/get-chat-config")
@verify_token()
async def get_chat_config_endpoint(decoded_payload: dict = None):
    return await get_chat_config_service(company_name=decoded_payload["company_name"])


@app.post("/chat-config")
@verify_token()
async def chat_config_endpoint(
    chat_data: chatModel, decoded_payload: dict = Depends(lambda: None)
):
    return await chat_config_service(chat_data, decoded_payload)

@app.put("/update-chat-config/{config_id}")
@verify_token()
async def update_chat_config_endpoint(
    config_id: str, chat_data: chatModel, decoded_payload: dict = Depends(lambda: None)
):
    return await update_chat_config_service(config_id, chat_data, decoded_payload)
# Customer Management Endpoints

@app.post("/customers")
async def store_customer_endpoint(customer_data: CustomerInfoRequest):
    """
    Store customer/store information in MongoDB and Zilliz
    
    This endpoint:
    1. Stores customer data in MongoDB with auto-generated ID
    2. Generates embeddings from customer description
    3. Stores embeddings in Zilliz with MongoDB ID reference
    """
    return await store_customer_service(customer_data)


@app.get("/customers/{customer_id}")
async def get_customer_endpoint(customer_id: str):
    """Retrieve customer data by MongoDB ID"""
    return await get_customer_by_id_service(customer_id)


@app.get("/search")
async def search_customers_endpoint(query: str = Query(..., description="Search query"), top_k: int = Query(5, description="Number of results")):
    """
    Semantic search for customers using Zilliz vector database
    
    This endpoint:
    1. Generates embedding for the search query
    2. Finds similar customer embeddings in Zilliz
    3. Retrieves full customer data from MongoDB
    4. Returns ranked results with similarity scores
    """
    return await search_customer_service(query, top_k)


# Chat Endpoints

@app.post("/chat")
async def chat_endpoint(request: chatRequest, api: str = Query(..., description="API Key provided in URL")):
    return await chat_endpoint_service(request, api)


@app.post("/chat-smart")
async def chat_smart_endpoint(request: chatRequest, api: str = Query(..., description="API Key provided in URL")):
    """
    Enhanced chat endpoint with vector search
    
    This endpoint:
    1. Validates API key
    2. Searches Zilliz for relevant customer data based on query
    3. Injects customer context into AI prompt
    4. Returns smart response with customer information
    """
    return await chat_smart_endpoint_service(request, api)


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)