from pydantic import BaseModel


class chatRequest(BaseModel):
    message: str


class userRegistrationRequest(BaseModel):
    company_name: str
    founded: str
    location: str
    email: str
    password: str
    
class userLoginRequest(BaseModel):
    email: str
    password: str


class chatModel(BaseModel):
    question: str
    answer: str


class CompanyKnowledgeIngestRequest(BaseModel):
    text: str
    max_pairs: int = 18


# Customer/Store data model
class CustomerInfoRequest(BaseModel):
    name: str
    id: str  # Store ID like "1234" or "12345"
    description: str  # Description of the store/customer for embeddings


# Search request model
class SearchRequest(BaseModel):
    query: str


class Chatdata(BaseModel):
    company_name: str
    question: str   
    answer: str 