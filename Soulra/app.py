# app.py
import sys
import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

# -------------------------
# 🔥 FORCE EARLY LOGS
# -------------------------
print("🔥 app.py loaded")
print("🔥 Python version:", sys.version)

# -------------------------
# 🔥 RENDER-SAFE LOGGING
# -------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
    force=True,
)
logger = logging.getLogger("soulra")
logger.info("🔥 Logger initialized")

# -------------------------
# FASTAPI INIT
# -------------------------
api_app = FastAPI(title="Soulra AI API")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://soulease-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# SCHEMAS
# -------------------------
class ChatRequest(BaseModel):
    conversation_id: str
    message: str

# -------------------------
# 🔍 HEALTH CHECK (VERY IMPORTANT)
# -------------------------
@api_app.get("/health")
async def health():
    logger.info("✅ Health endpoint called")
    return {"status": "ok"}

# -------------------------
# 🔍 SIMPLE TEST ENDPOINT
# -------------------------
@api_app.post("/chat-test")
async def chat_test():
    logger.info("🧪 chat-test called")
    return {"ai_reply": "Server is alive"}

# -------------------------
# 🔥 REAL CHAT ENDPOINT
# -------------------------
@api_app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    logger.info("📩 /chat called")
    logger.info(f"Conversation ID: {request.conversation_id}")
    logger.info(f"User message: {request.message}")

    try:
        # Lazy import to avoid silent boot crash
        from graph.medical_graph import app as langgraph_app
        from utils.db import (
            load_conversation_for_ai,
            save_ai_chat_messages,
        )

        logger.info("📦 Imports OK")

        conversation_context = load_conversation_for_ai(
            request.conversation_id
        )
        logger.info(f"🧠 Loaded {len(conversation_context)} messages")

        conversation_context.append(
            HumanMessage(content=request.message)
        )

        inputs = {
            "messages": conversation_context,
            "recent_conversations": conversation_context,
            "next_agent": None,
            "summary": "",
            "prescription": "",
        }

        logger.info("🚀 Running LangGraph")

        response_parts = []
        for output in langgraph_app.stream(inputs):
            for value in output.values():
                if "messages" in value and value["messages"]:
                    response_parts.append(
                        value["messages"][-1].content
                    )

        ai_response = "\n".join(response_parts)
        logger.info("✅ LangGraph finished")

        save_ai_chat_messages(
            request.conversation_id,
            [
                {"sender": "user", "text": request.message},
                {"sender": "ai", "text": ai_response},
            ],
        )

        return {"ai_reply": ai_response}

    except Exception as e:
        logger.exception("❌ /chat failed")
        raise HTTPException(status_code=500, detail=str(e))
