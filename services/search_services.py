from services.embedding_services import generate_embedding
from zilliz_db import search_similar_customers
from services.customer_services import get_customers_by_ids_service


async def search_customer_service(query: str, top_k: int = 5):
    """
    Semantic search for customers using Zilliz vector database
    
    Flow:
    1. Generate embedding for user query
    2. Search similar vectors in Zilliz
    3. Get MongoDB IDs from Zilliz results
    4. Fetch full customer data from MongoDB
    5. Return combined results with similarity scores
    """
    try:
        # Generate query embedding
        query_embedding = generate_embedding(query)
        
        # Search in Zilliz for similar customer embeddings
        zilliz_results = search_similar_customers(query_embedding, top_k=top_k)
        
        if not zilliz_results or len(zilliz_results) == 0:
            return {
                "success": True,
                "query": query,
                "results": [],
                "count": 0,
                "message": "No matching customers found"
            }
        
        # Extract MongoDB IDs from Zilliz results
        mongodb_ids = [result["mongodb_id"] for result in zilliz_results]
        
        # Fetch full customer data from MongoDB
        mongo_response = await get_customers_by_ids_service(mongodb_ids)
        
        if not mongo_response["success"]:
            return {
                "success": False,
                "error": "Failed to retrieve customer data from MongoDB"
            }
        
        # Combine Zilliz similarity scores with MongoDB data
        customers_dict = {str(c["_id"]): c for c in mongo_response["customers"]}
        
        combined_results = []
        for zilliz_result in zilliz_results:
            mongodb_id = zilliz_result["mongodb_id"]
            if mongodb_id in customers_dict:
                customer = customers_dict[mongodb_id]
                combined_results.append({
                    "customer": customer,
                    "similarity_score": zilliz_result["similarity_score"],
                    "distance": zilliz_result["distance"]
                })
        
        return {
            "success": True,
            "query": query,
            "results": combined_results,
            "count": len(combined_results)
        }
        
    except Exception as e:
        print(f"Error in search service: {e}")
        return {
            "success": False,
            "error": str(e)
        }
