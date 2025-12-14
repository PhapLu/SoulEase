
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from graph.medical_graph import app as langgraph_app  
from datetime import datetime, timedelta
from utils.db import load_conversations_from_mongo, save_message, load_conversations_for_ai

api_app = FastAPI(title="Soulra AI API")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    patient_id: str
    message: str

@api_app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Load 7-day conversations for this patient
        recent_convs = load_conversations_from_mongo(request.patient_id)
        
        # persist the user's message
        save_message(request.patient_id, "user", request.message)

        inputs = {
            "messages": [HumanMessage(content=request.message)],
            "recent_conversations": recent_convs,
            "next_agent": None,
            "summary": "",
            "prescription": ""
        }
        
        # Run LangGraph and collect response
        response_parts = []
        for output in langgraph_app.stream(inputs):
            for key, value in output.items():
                if "messages" in value and value["messages"]:
                    response_parts.append(value["messages"][-1].content)
        
        full_response = "\n".join(response_parts)

        save_message(request.patient_id, "ai", full_response)
        
        return {"response": full_response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# New endpoint: get chat history for a patient (last 7 days)
@api_app.get("/chat/history/{patient_id}")
async def get_chat_history(patient_id: str):
    try:
        conversations = load_conversations_for_ai(patient_id)
        return {"patient_id": patient_id, "conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api_app, host="0.0.0.0", port=8000)  # Run on port 8000
