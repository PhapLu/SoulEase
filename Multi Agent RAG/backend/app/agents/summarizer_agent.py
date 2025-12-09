from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from langchain.output_parsers import StrOutputParser
from langchain.schema.runnable import RunnableSequence

from ..llm import LocalGemmaChat
from ..models.state import AgentState

llm = LocalGemmaChat()

async def summarizer_node(state: AgentState) -> AgentState:
    convo = state["last_conversations"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "You are a clinical summarization assistant. Summarize the last 7 days of mental health conversation."),
        ("human", "Conversation log:\n{conversation}")
    ])

    chain = RunnableSequence([
        prompt,
        llm,
        StrOutputParser()
    ])

    answer = await chain.ainvoke({"conversation": convo})
    state["answer"] = answer
    return state
