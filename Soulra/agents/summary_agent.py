# agents/summary_agent.py
from utils.local_llm import get_local_llm
from utils.prompts import SUMMARY_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage

llm = get_local_llm(temperature=0.5)

def summary_agent_node(state):
    recent_convs = state["recent_conversations"][-14:]
    conv_text = "\n".join([f"{m.type}: {m.content}" for m in recent_convs])
    messages = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Last 7 days conversation:\n{conv_text}")
    ]
    response = llm.invoke(messages)
    return {"messages": [response], "summary": response.content}