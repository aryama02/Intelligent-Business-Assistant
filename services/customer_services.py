from db import get_database
from services.embedding_services import generate_embedding
from zilliz_db import insert_customer_embedding, delete_customer_embedding
from model.schema import CustomerInfoRequest
from bson import ObjectId
from datetime import datetime


async def store_customer_service(customer_data: CustomerInfoRequest):
    """
    Store customer data in MongoDB and embeddings in Zilliz
    
    Flow:
    1. Store customer info in MongoDB -> get ID
    2. Generate embedding from customer description
    3. Store embedding in Zilliz with MongoDB ID reference
    """
    try:
        customers_collection = get_database().get_collection("customers")
        
        # Prepare customer document for MongoDB
        customer_doc = {
            "store_id": customer_data.id,
            "name": customer_data.name,
            "description": customer_data.description,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into MongoDB
        result = await customers_collection.insert_one(customer_doc)
        mongodb_id = str(result.inserted_id)
        
        # Generate embedding from customer description
        # Combine name and description for better semantic search
        text_for_embedding = f"{customer_data.name}: {customer_data.description}"
        embedding = generate_embedding(text_for_embedding)
        
        # Store in Zilliz with MongoDB ID reference
        insert_customer_embedding(
            mongodb_id=mongodb_id,
            customer_name=customer_data.name,
            customer_data=text_for_embedding,
            embedding=embedding
        )
        
        return {
            "success": True,
            "message": "Customer data stored successfully",
            "mongodb_id": mongodb_id,
            "store_id": customer_data.id,
            "name": customer_data.name
        }
        
    except Exception as e:
        print(f"Error storing customer: {e}")
        return {
            "success": False,
            "error": str(e)
        }


async def get_customer_by_id_service(customer_id: str):
    """
    Retrieve customer data from MongoDB by ID
    """
    try:
        customers_collection = get_database().get_collection("customers")
        
        # Convert string ID to ObjectId
        customer = await customers_collection.find_one({"_id": ObjectId(customer_id)})
        
        if customer:
            customer["_id"] = str(customer["_id"])
            return {
                "success": True,
                "customer": customer
            }
        else:
            return {
                "success": False,
                "error": "Customer not found"
            }
            
    except Exception as e:
        print(f"Error retrieving customer: {e}")
        return {
            "success": False,
            "error": str(e)
        }


async def get_customers_by_ids_service(customer_ids: list):
    """
    Retrieve multiple customers from MongoDB by IDs
    """
    try:
        customers_collection = get_database().get_collection("customers")
        
        # Convert string IDs to ObjectIds
        object_ids = [ObjectId(cid) for cid in customer_ids]
        
        # Fetch all customers
        cursor = customers_collection.find({"_id": {"$in": object_ids}})
        customers = await cursor.to_list(length=len(customer_ids))
        
        # Convert ObjectId to string
        for customer in customers:
            customer["_id"] = str(customer["_id"])
        
        return {
            "success": True,
            "customers": customers,
            "count": len(customers)
        }
        
    except Exception as e:
        print(f"Error retrieving customers: {e}")
        return {
            "success": False,
            "error": str(e)
        }


async def delete_customer_service(customer_id: str):
    """
    Delete customer from both MongoDB and Zilliz
    """
    try:
        customers_collection = get_database().get_collection("customers")
        
        # Delete from MongoDB
        result = await customers_collection.delete_one({"_id": ObjectId(customer_id)})
        
        if result.deleted_count > 0:
            # Delete from Zilliz
            delete_customer_embedding(customer_id)
            
            return {
                "success": True,
                "message": "Customer deleted successfully"
            }
        else:
            return {
                "success": False,
                "error": "Customer not found"
            }
            
    except Exception as e:
        print(f"Error deleting customer: {e}")
        return {
            "success": False,
            "error": str(e)
        }
