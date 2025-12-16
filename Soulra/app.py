# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from graph.medical_graph import app as langgraph_app
from utils.db import (
    load_conversation_for_ai,
    load_conversation_for_ui,
    load_ai_chat_history,
    save_ai_chat_messages,
)

api_app = FastAPI(title="Soulra AI API")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    conversation_id: str
    message: str


# =========================
# AI Chat (Doctor assistant)
# =========================
@api_app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1️⃣ Load patient + doctor conversation
        conversation_context = load_conversation_for_ai(
            request.conversation_id
        )

        print("🧠 AI CONTEXT:")
        for m in conversation_context:
            print("-", m.content)

        # 2️⃣ Add doctor's current prompt
        conversation_context.append(
            HumanMessage(content=request.message)
        )

        # 3️⃣ Run LangGraph
        inputs = {
            "messages": conversation_context,
            "recent_conversations": conversation_context,  # 🔑 REQUIRED
            "next_agent": None,
            "summary": "",
            "prescription": "",
        }

        response_parts = []

        for output in langgraph_app.stream(inputs):
            for value in output.values():
                if "messages" in value and value["messages"]:
                    response_parts.append(
                        value["messages"][-1].content
                    )

        ai_response = "\n".join(response_parts)

        # 4️⃣ Save to AI history
        new_msgs = [
            {"sender": "user", "text": request.message},
            {"sender": "ai", "text": ai_response},
        ]
        saved = save_ai_chat_messages(
            request.conversation_id,
            new_msgs
        )
        if not saved:
            print("⚠️ Failed to save AI chat")

        return {
            "ai_reply": ai_response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================
# Conversation history (UI)
# =========================
@api_app.get("/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str):
    history = load_conversation_for_ui(conversation_id)

    return {
        "conversation_id": conversation_id,
        "messages": history,
    }


# =========================
# AI Chat History (Right panel)
# =========================
@api_app.get("/ai-history/{conversation_id}")
async def get_ai_history(conversation_id: str):
    history = load_ai_chat_history(conversation_id)

    return {
        "conversation_id": conversation_id,
        "messages": history,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api_app, host="0.0.0.0", port=8000)