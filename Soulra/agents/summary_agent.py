# agents/summary_agent.py
from utils.llm import get_local_llm
from utils.prompts import SUMMARY_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage

llm = get_local_llm(temperature=0.5)

def summary_agent_node(state):
    # Use ALL available conversations from state
    convs = state["recent_conversations"]

    conv_text = "\n".join(
        [f"{m.type}: {m.content}" for m in convs]
    )

    messages = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Conversation between doctor and patient:\n{conv_text}")
    ]

    response = llm.invoke(messages)

    return {
        "messages": [response],
        "summary": response.content
    }