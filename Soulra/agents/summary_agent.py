# agents/summary_agent.py

from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_local_llm
from utils.prompts import SUMMARY_PROMPT

# Groq LLM (via get_local_llm wrapper)
llm = get_local_llm(temperature=0.5, max_tokens=1024)

def summary_agent_node(state):
    # Use ALL available conversations from state (safe access)
    convs = state.get("recent_conversations", [])

    conv_text = "\n".join([f"{m.type}: {m.content}" for m in convs]) if convs else "No conversation data provided."

    messages = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Conversation between doctor and patient:\n{conv_text}"),
    ]

    response = llm.invoke(messages)

    return {
        "messages": [response],       # AIMessage
        "summary": response.content   # string
    }
