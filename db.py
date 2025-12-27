from motor.motor_asyncio import AsyncIOMotorClient

# Replace with your actual connection string or use environment variables
MONGO_DETAILS = "mongodb+srv://Aryan_10:mynameisMA11@cluster0.0xteier.mongodb.net/chat_bot?appName=Cluster0"

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGO_DETAILS)
    print("Connected to MongoDB")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")

def get_database():
    # Return the specific database instance
    return db.client.chat_bot