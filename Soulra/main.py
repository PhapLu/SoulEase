# main.py
from langchain_core.messages import HumanMessage
from graph.medical_graph import app
from utils.db import load_conversations_from_mongo 

def load_conversations():
    try:
        return load_conversations_from_mongo()
    except Exception as e:
        print(f"Error loading from MongoDB: {e}")
        return []  # Fallback

def main():
    
    print("Soulra is ready")
    recent_convs = load_conversations()

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            break

        inputs = {
            "messages": [HumanMessage(content=user_input)],
            "recent_conversations": recent_convs,
            "next_agent": None,
            "summary": "",
            "prescription": ""
        }

        print("Bot (local): ", end="", flush=True)
        try:
            for output in app.stream(inputs):
                for key, value in output.items():
                    if "messages" in value and value["messages"]:
                        print(value["messages"][-1].content)
                        print("-" * 50)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()