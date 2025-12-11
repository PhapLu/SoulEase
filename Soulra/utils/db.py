# utils/db.py
from pymongo import MongoClient
from datetime import datetime, timedelta
from langchain_core.messages import HumanMessage
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_default_database() 

def load_conversations_from_mongo():
    collection = db['conversations'] 
    
    seven_days_ago = datetime.now() - timedelta(days=14)

    cursor = collection.find({"timestamp": {"$gte": seven_days_ago}}).sort("timestamp", 1)
    
    conversations = []
    for doc in cursor:
        msg = HumanMessage(content=doc['content'])
        conversations.append(msg)
    
    return conversations[-28:]