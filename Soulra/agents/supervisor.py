from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_local_llm
from utils.prompts import SUPERVISOR_PROMPT

llm = get_local_llm(temperature=0.0, max_tokens=256)

def supervisor_node(state):
    user_message = state.get("messages", [])[-1].content if state.get("messages") else ""

    messages = [
        SystemMessage(content=SUPERVISOR_PROMPT),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)

    result = (response.content or "").strip().lower()

    valid = {"summary", "prescription", "general"}

    next_agent = None
    for v in valid:
        if v == result or v in result:
            next_agent = v
            break

    if next_agent is None:
        next_agent = "general"

    return {"next_agent": next_agent}
