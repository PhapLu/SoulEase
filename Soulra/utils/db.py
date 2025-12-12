# utils/db.py
from pymongo import MongoClient
from datetime import datetime, timedelta
from langchain_core.messages import HumanMessage
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_database() 

def load_conversations_from_mongo(limit: int = 200) -> list[HumanMessage]:
    """
    Returns the last 7 days of conversations from MongoDB
    """
    try:
        # 7 days ago in UTC (MongoDB stores in UTC)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        query = {"timestamp": {"$gte": seven_days_ago}}

        cursor = (
            db.conversations
            .find(query)
            .sort("timestamp", 1)
            .limit(limit)
        )

        messages = []
        for doc in cursor:
            content = (
                doc.get("content") or
                doc.get("message") or
                doc.get("text") or
                ""
            )
            if content.strip():
                messages.append(HumanMessage(content=content.strip()))
        return messages

    except Exception as e:
        print(f"[MongoDB Error] {e}")
        return []