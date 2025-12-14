// ...existing code...
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Soulra from "../../../assets/icons/Soulra.svg";
// import { apiUtils } from "../../../utils/newRequest";
import { pythonApiUtils } from "../../../utils/pythonRequest";
import "../../../pages/workSpace/conversation/Conversations.css";

export default function AssistantPanel() {
    const { conversationId } = useParams(); // This is the patient/conversation ID
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([
        { sender: "ai", text: "Hello! How may I help?" },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch chat history when switching patient / conversation
    useEffect(() => {
        if (!conversationId) {
            setMessages([{ sender: "ai", text: "Hello! How may I help?" }]);
            return;
        }

        let cancelled = false;
        const loadHistory = async () => {
            setIsFetchingHistory(true);
            try {
                const res = await pythonApiUtils.get(
                    `/chat/history/${conversationId}`
                );
                const convs = res.data?.conversations || [];

                // Normalize various possible shapes of stored conversations
                const parsed = convs.map((item) => {
                    if (!item) return { sender: "ai", text: "" };
                    if (item.sender && item.text)
                        return { sender: item.sender, text: item.text };
                    if (item.role && item.content) {
                        const role = item.role === "user" ? "user" : "ai";
                        return { sender: role, text: item.content };
                    }
                    if (item.message)
                        return { sender: "user", text: String(item.message) };
                    if (typeof item === "string")
                        return { sender: "ai", text: item };
                    // fallback: stringify object
                    return { sender: "ai", text: JSON.stringify(item) };
                });

                if (!cancelled) {
                    // If no history, keep default greeting
                    if (parsed.length === 0) {
                        setMessages([
                            { sender: "ai", text: "Hello! How may I help?" },
                        ]);
                    } else {
                        setMessages(parsed);
                    }
                }
            } catch (err) {
                console.error("Failed to load conversation history:", err);
                if (!cancelled) {
                    setMessages([
                        { sender: "ai", text: "Hello! How may I help?" },
                    ]);
                }
            } finally {
                if (!cancelled) setIsFetchingHistory(false);
            }
        };
        loadHistory();
        return () => {
            cancelled = true;
        };
    }, [conversationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !conversationId || isLoading) return;

        const userMessage = text.trim();
        setText("");
        setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await pythonApiUtils.post("/chat", {
                patient_id: conversationId, // ← Matches your MongoDB field and FastAPI
                message: userMessage,
            });

            const aiReply = response.data.response || "No response from AI.";

            setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
        } catch (error) {
            console.error("Soulra AI API Error:", error);
            const errorMsg =
                error.response?.data?.detail ||
                error.message ||
                "Connection failed.";
            setMessages((prev) => [
                ...prev,
                { sender: "ai", text: `Error: ${errorMsg}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const noConversationSelected = !conversationId;

    return (
        <aside className="ws-assistant">
            {/* Header */}
            <div className="ws-assistant__header">
                <img src={Soulra} width={40} height={40} alt="Soulra" />
                <div className="ws-assistant__title">Soulra Assistant</div>
            </div>

            {/* Chat Body */}
            <div className="ws-assistant__body">
                {noConversationSelected ? (
                    <div className="ws-assistant__empty">
                        <p>
                            Select a conversation on the left to start using
                            Soulra Assistant.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`ws-assistant__bubble ${
                                    msg.sender === "user" ? "user" : "ai"
                                }`}
                            >
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isFetchingHistory && (
                            <div className="ws-assistant__bubble--reply">
                                <p>Loading history...</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="ws-assistant__bubble--reply">
                                <p>Thinking...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Form */}
            <form className="ws-assistant__input" onSubmit={handleSubmit}>
                <input
                    placeholder={
                        noConversationSelected
                            ? "Select a patient first"
                            : "Ask any request..."
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading || noConversationSelected}
                />
                <button
                    type="submit"
                    disabled={
                        isLoading || !text.trim() || noConversationSelected
                    }
                >
                    Send
                </button>
            </form>
        </aside>
    );
}