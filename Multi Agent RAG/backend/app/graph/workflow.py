from typing import Literal
from langgraph.graph import StateGraph, END

from ..models.state import AgentState
from ..agents.orchestrator import orchestrator_node
from ..agents.summarizer_agent import summarizer_node
from ..agents.suggest_agent import suggest_node
from ..agents.general_agent import general_chat_node

# Node names
ORCH = "orchestrator"
SUMMARIZER = "summarizer"
SUGGEST = "suggest"
CHAT = "chat"

def _route_from_orchestrator(state: AgentState) -> Literal["summarizer", "suggest", "chat"]:
    intent = state.get("intent", "chat")
    if intent == "summarize":
        return SUMMARIZER
    elif intent == "suggest":
        return SUGGEST
    else:
        return CHAT

def build_graph():
    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node(ORCH, orchestrator_node)
    graph.add_node(SUMMARIZER, summarizer_node)
    graph.add_node(SUGGEST, suggest_node)
    graph.add_node(CHAT, general_chat_node)

    # Entry
    graph.set_entry_point(ORCH)

    # Conditional routing
    graph.add_conditional_edges(
        ORCH,
        _route_from_orchestrator,
        {
            SUMMARIZER: SUMMARIZER,
            SUGGEST: SUGGEST,
            CHAT: CHAT,
        },
    )

    # Each agent ends the graph
    graph.add_edge(SUMMARIZER, END)
    graph.add_edge(SUGGEST, END)
    graph.add_edge(CHAT, END)

    return graph.compile()
