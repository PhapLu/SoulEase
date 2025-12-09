from pymongo import MongoClient
from .config import MONGO_URI, MONGO_DB_NAME

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# Adjust collection names to match your real DB
conversations_col = db["Conversations"]
# prescriptions_col = db["Prescriptions"]
