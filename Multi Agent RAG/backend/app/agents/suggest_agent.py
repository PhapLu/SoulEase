from langchain.prompts import ChatPromptTemplate
from langchain.tools import DuckDuckGoSearchRun
from langchain.schema.runnable import RunnableParallel, RunnableSequence
from langchain.output_parsers import StrOutputParser

from ..llm import LocalGemmaChat
from ..models.state import AgentState

llm = LocalGemmaChat()
search_tool = DuckDuckGoSearchRun()

async def suggest_node(state: AgentState) -> AgentState:
    convo = state["last_conversations"]
    prescription = state["latest_prescription"]

    # Combine tools + model using LangChain
    tool_call = RunnableParallel({
        "web_results": lambda _: search_tool.run("mental health clinical guideline"),
        "conversation": lambda _: convo,
        "rx": lambda _: prescription,
    })

    prompt = ChatPromptTemplate.from_template("""
Use the conversation and latest prescription and the web results to create a markdown table of treatment suggestions.

Conversation:
{conversation}

Latest Prescription:
{rx}

Research:
{web_results}

### Return a markdown table with columns:
| Option | Type | Rationale | Notes/Risks |
""")

    chain = RunnableSequence([
        tool_call,
        prompt,
        llm,
        StrOutputParser(),
    ])

    answer = await chain.ainvoke({})
    state["answer"] = answer
    return state
