from datetime import datetime, timedelta, timezone

from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableSequence
from langchain.output_parsers import StrOutputParser

from ..models.state import AgentState
from ..llm import LocalGemmaChat
from ..db import conversations_col, prescriptions_col
from ..config import CONVERSATION_DAYS_WINDOW

llm = LocalGemmaChat()

async def orchestrator_node(state: AgentState) -> AgentState:
    patient_id = state["patient_id"]
    doctor_id = state["doctor_id"]
    user_message = state["user_message"]

    # 1) Fetch last N days of conversation from MongoDB
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=CONVERSATION_DAYS_WINDOW)

    # If your `timestamp` field is a Date type in MongoDB, this works directly:
    cursor = conversations_col.find(
        {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "timestamp": {"$gte": since},
        }
    ).sort("timestamp", 1)

    messages = list(cursor)

    if messages:
        convo_text = "\n".join(
            f"[{m.get('timestamp')}] {str(m.get('role','')).upper()}: {m.get('message','')}"
            for m in messages
        )
    else:
        convo_text = ""

    state["last_conversations"] = convo_text

    # 2) Fetch latest prescription from MongoDB
    latest_rx_doc = prescriptions_col.find_one(
        {"patient_id": patient_id, "doctor_id": doctor_id},
        sort=[("timestamp", -1)],
    )
    latest_rx_content = latest_rx_doc.get("content") if latest_rx_doc else None
    state["latest_prescription"] = latest_rx_content

    # 3) Use LangChain to classify intent (summarize / suggest / chat)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an orchestrator for a mental-health clinical assistant.\n"
            "You must classify the doctor's request into ONE of:\n"
            "- summarize: they want a summary of recent sessions\n"
            "- suggest: they want treatment options / prescription suggestions\n"
            "- chat: general questions or conversation\n"
            "Return ONLY one word: summarize, suggest, or chat."
        ),
        ("human", "{query}")
    ])

    chain = RunnableSequence([
        prompt,
        llm,
        StrOutputParser(),
    ])

    intent_raw = (await chain.ainvoke({"query": user_message})).lower().strip()

    if "summarize" in intent_raw:
        intent = "summarize"
    elif "suggest" in intent_raw or "treat" in intent_raw or "prescription" in intent_raw:
        intent = "suggest"
    else:
        intent = "chat"

    # 4) If no conversation and intent needs conversation → fallback to general chat
    if not convo_text and intent in ("summarize", "suggest"):
        intent = "chat"

    state["intent"] = intent
    state.setdefault("debug", {})
    state["debug"]["orchestrator_intent"] = intent
    state["debug"]["conversation_exists"] = bool(convo_text)

    return state
