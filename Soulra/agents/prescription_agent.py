# agents/prescription_agent.py

from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_local_llm
from utils.prompts import PRESCRIPTION_PROMPT

# Groq LLM (via get_local_llm wrapper)
llm = get_local_llm(temperature=0.2, max_tokens=1024)

def prescription_agent_node(state):
    # an toàn khi key không có hoặc list rỗng
    recent_convs = state.get("recent_conversations", [])
    recent_convs = recent_convs[-14:]  # lấy 14 message gần nhất (tuỳ bạn)
    last_prescription = state.get("last_prescription", "None")

    conv_text = "\n".join([f"{m.type}: {m.content}" for m in recent_convs]) if recent_convs else "No recent conversations."

    prompt_input = (
        "Recent conversations (last 7 days / most recent messages):\n"
        f"{conv_text}\n\n"
        "Last prescription:\n"
        f"{last_prescription}"
    )

    messages = [
        SystemMessage(content=PRESCRIPTION_PROMPT),
        HumanMessage(content=prompt_input),
    ]

    response = llm.invoke(messages)

    return {
        "messages": [response],                 # AIMessage for LangGraph
        "prescription": response.content.strip()  # plain string for state
    }
