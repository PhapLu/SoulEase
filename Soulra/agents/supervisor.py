# agents/supervisor.py
from utils.local_llm import get_local_llm
from utils.prompts import SUPERVISOR_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage

llm = get_local_llm(temperature=0.0)

def supervisor_node(state):
    user_message = state["messages"][-1].content
    messages = [
        SystemMessage(content=SUPERVISOR_PROMPT),
        HumanMessage(content=user_message)
    ]
    response = llm.invoke(messages)
    result = response.content.strip().lower()
    valid = ["summary", "prescription", "general"]
    next_agent = result if result in valid else "general"
    return {"next_agent": next_agent}