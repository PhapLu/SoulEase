from typing import TypedDict, List, Optional, Literal, Dict, Any

class AgentState(TypedDict, total=False):
    # Input
    user_message: str
    patient_id: str
    doctor_id: str

    # Context from DB
    last_conversations: str 
    latest_prescription: Optional[str]

    # Orchestrator decisions
    intent: Literal["summarize", "suggest", "chat"]

    # Outputs
    answer: str
    debug: Dict[str, Any]
