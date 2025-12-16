# config.py
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_LOCAL_CONNECTION_STRING")

NODE_API_BASE = os.getenv(
    "NODE_API_BASE",
    "http://localhost:3000/v1/api/conversation"
)

NODE_INTERNAL_TOKEN = os.getenv(
    "NODE_INTERNAL_TOKEN",
    ""
)