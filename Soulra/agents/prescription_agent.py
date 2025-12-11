# agents/prescription_agent.py
from utils.local_llm import get_local_llm
from utils.prompts import PRESCRIPTION_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage

llm = get_local_llm(temperature=0.2)

def prescription_agent_node(state):
    recent_convs = state["recent_conversations"][-14:]
    last_prescription = state.get("last_prescription", "None")
    conv_text = "\n".join([f"{m.type}: {m.content}" for m in recent_convs])
    messages = [
        SystemMessage(content=PRESCRIPTION_PROMPT),
        HumanMessage(content=f"Last 7 days conversation:\n{conv_text}\nLast prescription:\n{last_prescription}")
    ]
    response = llm.invoke(messages)
    return {"messages": [response], "prescription": response.content.strip()}