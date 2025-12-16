# utils/db.py
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from langchain_core.messages import HumanMessage, AIMessage
from config import MONGO_URI
from datetime import datetime

client = MongoClient(MONGO_URI)
db = client.get_database()


# =========================
# Helpers
# =========================
def to_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None


# =========================
# Load conversation for AI context
# =========================
def load_conversation_for_ai(conversation_id: str, limit: int = 200):
    """
    Returns LangChain messages representing
    patient + doctor conversation
    """
    oid = to_object_id(conversation_id)
    if not oid:
        print("❌ Invalid conversation_id:", conversation_id)
        return []

    conversation = db.Conversations.find_one({"_id": oid})
    if not conversation:
        print("❌ Conversation not found:", conversation_id)
        return []

    messages = conversation.get("messages", [])[-limit:]

    langchain_messages = []

    for msg in messages:
        content = msg.get("content", "")
        if not content:
            continue

        # 🔑 IMPORTANT:
        # For now, BOTH patient & doctor are treated as HumanMessage
        # AI will respond as AIMessage
        langchain_messages.append(
            HumanMessage(content=content)
        )

    return langchain_messages


# =========================
# Load conversation for UI
# =========================
def load_conversation_for_ui(conversation_id: str, limit: int = 200):
    oid = to_object_id(conversation_id)
    if not oid:
        return []

    conversation = db.Conversations.find_one({"_id": oid})
    if not conversation:
        return []

    messages = conversation.get("messages", [])[-limit:]

    return [
        {
            "senderId": str(msg.get("senderId")),
            "content": msg.get("content"),
            "createdAt": msg.get("createdAt").isoformat()
            if msg.get("createdAt") else None,
        }
        for msg in messages
    ]


# =========================
# AI Assistant Chat History
# =========================
# Use new collection: ai_assistant_chats
ai_chats = db.ai_assistant_chats


def load_ai_chat_history(conversation_id: str, limit: int = 100):
    """
    Returns list of AI chat messages for a conversation (doctor-AI only)
    Format: [{'sender': 'user/ai', 'text': '...', 'timestamp': '...'}]
    """
    oid = to_object_id(conversation_id)
    if not oid:
        return []

    doc = ai_chats.find_one({"conversation_id": oid})
    if not doc:
        return []

    history = doc.get("messages", [])[-limit:]
    
    return [
        {
            "sender": msg["sender"],  # 'user' or 'ai'
            "text": msg["text"],
            "timestamp": msg["timestamp"].isoformat()
        }
        for msg in history
    ]


def save_ai_chat_messages(conversation_id: str, new_messages: list):
    """
    Append new messages to AI history
    new_messages: [{'sender': 'user/ai', 'text': '...'}]
    """
    oid = to_object_id(conversation_id)
    if not oid:
        return False

    formatted_msgs = [
        {
            "sender": msg["sender"],
            "text": msg["text"],
            "timestamp": datetime.utcnow()
        }
        for msg in new_messages
    ]

    result = ai_chats.update_one(
        {"conversation_id": oid},
        {
            "$push": {"messages": {"$each": formatted_msgs}},
            "$set": {"updated_at": datetime.utcnow()}
        },
        upsert=True
    )

    return result.modified_count > 0 or result.upserted_id is not None