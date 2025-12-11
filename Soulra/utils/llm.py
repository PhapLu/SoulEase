# utils/local_llm.py
from langchain_ollama import ChatOllama

def get_local_llm(temperature=0.3, max_tokens=1024):
    return ChatOllama(
        model="llama3:4b",
        temperature=temperature,
        max_tokens=max_tokens,
        base_url="http://localhost:11434"
    )