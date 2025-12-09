import os
from dotenv import load_dotenv

load_dotenv()

# --- MongoDB ---
MONGO_URI = os.getenv("MONGODB_CONNECTION_STRING") or os.getenv("MONGODB_LOCAL_CONNECTION_STRING")
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME", "SoulEaseDB")

# --- LLM (local Gemma3) ---
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434")
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gemma3:4b")

# --- Conversation window ---
CONVERSATION_DAYS_WINDOW = int(os.getenv("CONVERSATION_DAYS_WINDOW", "7"))
