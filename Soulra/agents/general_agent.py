# agents/general_agent.py
from utils.local_llm import get_local_llm
from utils.prompts import GENERAL_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage

llm = get_local_llm(temperature=0.8)

def general_agent_node(state):
    user_msg = state["messages"][-1].content
    messages = [
        SystemMessage(content=GENERAL_PROMPT),
        HumanMessage(content=user_msg)
    ]
    response = llm.invoke(messages)
    return {"messages": [response]}