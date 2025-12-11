# graph/medical_graph.py
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator
from langchain_core.messages import BaseMessage

from agents.supervisor import supervisor_node
from agents.summary_agent import summary_agent_node
from agents.prescription_agent import prescription_agent_node
from agents.general_agent import general_agent_node

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    recent_conversations: List[BaseMessage]
    last_prescription: str
    next_agent: str
    summary: str
    prescription: str

def route_agent(state):
    next = state.get("next_agent", "").strip().lower()
    if next == "summary": return "summary"
    if next == "prescription": return "prescription"
    if next == "general": return "general"
    return END

workflow = StateGraph(AgentState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("summary", summary_agent_node)
workflow.add_node("prescription", prescription_agent_node)
workflow.add_node("general", general_agent_node)

workflow.set_entry_point("supervisor")
workflow.add_conditional_edges("supervisor", route_agent)
workflow.add_edge("summary", END)
workflow.add_edge("prescription", END)
workflow.add_edge("general", END)

app = workflow.compile()