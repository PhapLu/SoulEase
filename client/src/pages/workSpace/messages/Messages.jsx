import { useState } from "react";
import Soulra from "../../../assets/icons/Soulra.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";
import "./Messages.css";

const conversations = [
    {
        id: 1,
        name: "Patient's name",
        snippet: "Hello, I am Lora...",
        time: "1 hour ago",
        unread: true,
    },
    {
        id: 2,
        name: "Patient's name",
        snippet: "Hello, I am Lora...",
    },
    {
        id: 3,
        name: "Patient's name",
        snippet: "Hello, I am Lora...",
    },
    {
        id: 4,
        name: "Patient's name",
        snippet: "Hello, I am Lora...",
    },
];

const demoMessages = [
    { id: 1, sender: "patient", text: "Hello, I am Lora" },
    { id: 2, sender: "me", text: "Hi Lora, How can I help you" },
];

const assistantMessages = [
    { id: 1, sender: "user", text: "Summarize the process treatment for me" },
    { id: 2, sender: "assistant", text: "Ok! Here is the summarization" },
];

export default function Messages() {
    const [text, setText] = useState("");
    const [assistantText, setAssistantText] = useState("");

    return (
        <div className="ws-messages">
            <WorkspaceTopBar />

            <div className="ws-panels">
                <aside className="ws-threads">
                    <h2>Messages</h2>
                    <div className="ws-input">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <input type="text" placeholder="Search" />
                    </div>
                    <ul className="ws-thread-list">
                        {conversations.map((item) => (
                            <li
                                key={item.id}
                                className={`ws-thread ${
                                    item.id === 1 ? "active" : ""
                                }`}
                            >
                                <div className="ws-thread__avatar" />
                                <div className="ws-thread__meta">
                                    <span className="ws-thread__name">
                                        {item.name}
                                    </span>
                                    <span className="ws-thread__snippet">
                                        {item.snippet}
                                    </span>
                                </div>
                                <div className="ws-thread__time">
                                    {item.time && <span>{item.time}</span>}
                                    {item.unread && (
                                        <span
                                            className="ws-dot"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="ws-chat">
                    <header className="ws-chat__header">
                        <div className="ws-chat__avatar" />
                        <div>
                            <div className="ws-chat__name">Patient's name</div>
                            <div className="ws-chat__status">Active now</div>
                        </div>
                    </header>

                    <div className="ws-chat__body">
                        {demoMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`ws-bubble ${
                                    msg.sender === "me" ? "ws-bubble--me" : ""
                                }`}
                            >
                                {msg.sender === "patient" && (
                                    <div className="ws-avatar-circle" />
                                )}
                                <p>{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    <form
                        className="ws-chat__input"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                </section>

                <aside className="ws-assistant">
                    <div className="ws-assistant__header">
                        <img
                            src={Soulra}
                            alt="Soulra AI icon"
                            width={40}
                            height={40}
                            style={{ display: "block" }}
                        />
                        <div>
                            <div className="ws-assistant__title">
                                Soulra Assistant
                            </div>
                        </div>
                    </div>

                    <div className="ws-assistant__divider" />

                    <div className="ws-assistant__body">
                        {assistantMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`ws-assistant__bubble ${
                                    msg.sender === "assistant"
                                        ? "ws-assistant__bubble--reply"
                                        : ""
                                }`}
                            >
                                {msg.sender === "assistant" && (
                                    <span className="ws-chip">S</span>
                                )}
                                <p>{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    <form
                        className="ws-assistant__input"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <input
                            type="text"
                            placeholder="Ask any request..."
                            value={assistantText}
                            onChange={(e) => setAssistantText(e.target.value)}
                        />
                        <button type="submit">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
}
