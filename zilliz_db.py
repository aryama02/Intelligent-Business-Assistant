from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
import os
from dotenv import load_dotenv

load_dotenv()

# Zilliz connection details
ZILLIZ_URI = os.getenv("ZILLIZ_URI")
ZILLIZ_TOKEN = os.getenv("ZILLIZ_TOKEN")

# Collection name
COLLECTION_NAME = "customer_embeddings"

# Embedding dimension for all-MiniLM-L6-v2 model
EMBEDDING_DIM = 384

class ZillizDatabase:
    client = None
    collection = None

zilliz_db = ZillizDatabase()

async def connect_to_zilliz():
    """Connect to Zilliz Cloud and create/load collection"""
    try:
        # Connect to Zilliz Cloud
        connections.connect(
            alias="default",
            uri=ZILLIZ_URI,
            token=ZILLIZ_TOKEN
        )
        print("Connected to Zilliz Cloud")
        
        # Check if collection exists, if not create it
        if utility.has_collection(COLLECTION_NAME):
            zilliz_db.collection = Collection(COLLECTION_NAME)
            zilliz_db.collection.load()
            print(f"Loaded existing collection: {COLLECTION_NAME}")
        else:
            # Define collection schema
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="mongodb_id", dtype=DataType.VARCHAR, max_length=100),
                FieldSchema(name="customer_name", dtype=DataType.VARCHAR, max_length=500),
                FieldSchema(name="customer_data", dtype=DataType.VARCHAR, max_length=5000),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM)
            ]
            
            schema = CollectionSchema(fields=fields, description="Customer data embeddings")
            
            # Create collection
            zilliz_db.collection = Collection(name=COLLECTION_NAME, schema=schema)
            
            # Create index for vector field to enable fast search
            index_params = {
                "index_type": "AUTOINDEX",
                "metric_type": "L2",  # Euclidean distance
                "params": {}
            }
            zilliz_db.collection.create_index(field_name="embedding", index_params=index_params)
            
            # Load collection into memory
            zilliz_db.collection.load()
            print(f"Created new collection: {COLLECTION_NAME}")
            
    except Exception as e:
        print(f"Error connecting to Zilliz: {e}")
        # Do not re-raise so the server can still start if Zilliz is temporarily unavailable

async def close_zilliz_connection():
    """Close connection to Zilliz"""
    try:
        if zilliz_db.collection:
            zilliz_db.collection.release()
        connections.disconnect("default")
        print("Closed Zilliz connection")
    except Exception as e:
        print(f"Error closing Zilliz connection: {e}")

def get_zilliz_collection():
    """Get the Zilliz collection instance"""
    return zilliz_db.collection

def insert_customer_embedding(mongodb_id: str, customer_name: str, customer_data: str, embedding: list):
    """
    Insert customer embedding into Zilliz
    """
    try:
        result = zilliz_db.collection.insert(data=[{
            "mongodb_id": mongodb_id,
            "customer_name": customer_name,
            "customer_data": customer_data,
            "embedding": embedding
        }])
        zilliz_db.collection.flush()
        return {"success": True, "insert_count": result.insert_count, "ids": list(result.primary_keys)}
    except Exception as e:
        print(f"Error inserting customer embedding: {e}")
        raise

def search_similar_customers(query_embedding: list, top_k: int = 5):
    """
    Search for similar customers using vector similarity
    """
    try:
        search_params = {
            "metric_type": "L2",
            "params": {}
        }
        
        results = zilliz_db.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["mongodb_id", "customer_name", "customer_data"]
        )
        
        # Format results
        formatted_results = []
        for hits in results:
            for hit in hits:
                formatted_results.append({
                    "mongodb_id": hit.entity.get("mongodb_id"),
                    "customer_name": hit.entity.get("customer_name"),
                    "customer_data": hit.entity.get("customer_data"),
                    "distance": hit.distance,
                    "similarity_score": 1 / (1 + hit.distance)  # Convert distance to similarity
                })
        
        return formatted_results
    except Exception as e:
        print(f"Error searching customers: {e}")
        raise

def update_customer_embedding(mongodb_id: str, customer_name: str, customer_data: str, embedding: list):
    """
    Update customer embedding in Zilliz by deleting existing one and inserting new one
    """
    try:
        # Delete existing embedding
        delete_customer_embedding(mongodb_id)
        
        # Insert new embedding
        return insert_customer_embedding(mongodb_id, customer_name, customer_data, embedding)
    except Exception as e:
        print(f"Error updating customer embedding: {e}")
        raise

def delete_customer_embedding(mongodb_id: str):
    """Delete customer embedding by MongoDB ID"""
    try:
        expr = f'mongodb_id == "{mongodb_id}"'
        zilliz_db.collection.delete(expr)
        zilliz_db.collection.flush()
        print(f"Deleted embedding for MongoDB ID: {mongodb_id}")
    except Exception as e:
        print(f"Error deleting customer embedding: {e}")
        raise
