from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import redis.asyncio as aioredis

load_dotenv()

# MongoDB Configuration
MONGO_DETAILS = os.getenv("MONGODB_URI")

# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT", 19767))
REDIS_USER = os.getenv("REDIS_USER", "default")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

class Database:
    client: AsyncIOMotorClient = None
    redis_client: aioredis.Redis = None

db = Database()

async def connect_to_mongo():
    if not MONGO_DETAILS:
        print("[ERROR] MONGODB_URI not found in environment variables!")
        return

    db.client = AsyncIOMotorClient(MONGO_DETAILS)
    try:
        # The ping command is cheap and does not require auth.
        await db.client.admin.command('ping')
        print(f"[SUCCESS] Connected to MongoDB (URI starts with: {MONGO_DETAILS[:15]}...)")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

async def connect_to_redis():
    db.redis_client = aioredis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        username=REDIS_USER,
        password=REDIS_PASSWORD,
        decode_responses=True
    )
    try:
        await db.redis_client.ping()
        print("Connected to Redis")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")

async def close_redis_connection():
    if db.redis_client:
        await db.redis_client.close()
        print("Closed Redis connection")

def get_database():
    return db.client.chat_bot

def get_redis():
    return db.redis_client

async def clear_old_cache(cache_key):
    await db.redis_client.delete(cache_key)


async def flush_redis():
    await db.redis_client.flushdb()
    print("Flushed Redis")