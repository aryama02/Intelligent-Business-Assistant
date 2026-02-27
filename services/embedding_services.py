from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

load_dotenv()

# Singleton pattern for the embedding model
class EmbeddingService:
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
            cls._model = SentenceTransformer(model_name)
            print(f"Loaded embedding model: {model_name}")
        return cls._instance
    
    def generate_embedding(self, text: str):
        """
        Generate embedding vector for given text.
        Returns a list of floats representing the embedding.
        """
        if not text or text.strip() == "":
            raise ValueError("Text cannot be empty")
        
        # Normalize text
        text = text.strip()
        
        # Generate embedding
        embedding = self._model.encode(text, convert_to_tensor=False)
        
        # Convert to list for JSON serialization
        return embedding.tolist()
    
    def generate_embeddings_batch(self, texts: list):
        """
        Generate embeddings for a batch of texts.
        More efficient for multiple texts.
        """
        if not texts or len(texts) == 0:
            raise ValueError("Texts list cannot be empty")
        
        # Normalize texts
        texts = [text.strip() for text in texts if text and text.strip()]
        
        # Generate embeddings
        embeddings = self._model.encode(texts, convert_to_tensor=False)
        
        # Convert to list of lists
        return [emb.tolist() for emb in embeddings]

# Create singleton instance
embedding_service = EmbeddingService()

def generate_embedding(text: str):
    """Helper function to generate embedding for a single text"""
    return embedding_service.generate_embedding(text)

def generate_embeddings_batch(texts: list):
    """Helper function to generate embeddings for multiple texts"""
    return embedding_service.generate_embeddings_batch(texts)
