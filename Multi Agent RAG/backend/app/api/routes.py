from fastapi import APIRouter
from pydantic import BaseModel

from ..graph.workflow import build_graph

router = APIRouter()
graph_app = build_graph()

class AgentRequest(BaseModel):
    user_message: str
    patient_id: str
    doctor_id: str

class AgentResponse(BaseModel):
    answer: str
    debug: dict | None = None

@router.post("/agent", response_model=AgentResponse)
async def run_agent(req: AgentRequest):
    initial_state = {
        "user_message": req.user_message,
        "patient_id": req.patient_id,
        "doctor_id": req.doctor_id,
    }

    # LangGraph compiled app can be async
    result = await graph_app.ainvoke(initial_state)

    return AgentResponse(
        answer=result["answer"],
        debug=result.get("debug"),
    )
