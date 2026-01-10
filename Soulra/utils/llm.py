from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

def get_local_llm(temperature=0.3, max_tokens=1024):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not set.\n"
            "Create a .env in the Soulra folder with GROQ_API_KEY=your_key or set it in your environment."
        )

    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=api_key,
    )