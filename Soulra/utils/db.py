# utils/db.py
from pymongo import MongoClient
from datetime import datetime, timedelta
from langchain_core.messages import HumanMessage, AIMessage
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_database() 

def save_message(patient_id: str, sender: str, content: str, timestamp: datetime = None):
    if timestamp is None:
        timestamp = datetime.utcnow()

    doc = {
        "patient_id": str(patient_id),
        "sender": sender,       
        "content": content,
        "timestamp": timestamp,
    }

    db.conversations.insert_one(doc)
    return doc
# load_conversations_from_mongo
def load_conversations_from_mongo(patient_id: str, limit: int = 200):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    cursor = (
        db.conversations
        .find({
            "patient_id": patient_id,
            "timestamp": {"$gte": seven_days_ago}
        })
        .sort("timestamp", 1)
        .limit(limit)
    )

    messages = []
    for doc in cursor:
        if doc["sender"] == "user":
            messages.append(HumanMessage(content=doc["content"]))
        else:
            messages.append(AIMessage(content=doc["content"]))

    return messages

def load_conversations_for_ai(patient_id: str, limit: int = 200):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    cursor = (
        db.conversations
        .find({
            "patient_id": patient_id,
            "timestamp": {"$gte": seven_days_ago}
        })
        .sort("timestamp", 1)
        .limit(limit)
    )

    return [
        {
            "sender": doc["sender"],
            "text": doc["content"],
            "timestamp": doc["timestamp"].isoformat(),
        }
        for doc in cursor
    ]
