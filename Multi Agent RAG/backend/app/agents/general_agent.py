from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableSequence
from langchain.output_parsers import StrOutputParser

from ..llm import LocalGemmaChat
from ..models.state import AgentState

llm = LocalGemmaChat()

async def general_chat_node(state: AgentState) -> AgentState:
    user_input = state["user_message"]

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are Sora AI, a friendly clinical assistant."),
        ("human", "{query}")
    ])

    chain = RunnableSequence([
        prompt,
        llm,
        StrOutputParser()
    ])

    answer = await chain.ainvoke({"query": user_input})
    state["answer"] = answer
    return state
