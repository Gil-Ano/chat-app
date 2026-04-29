import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

function ChatWindow({ messages, typingUser, title }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = search
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(search.toLowerCase()),
      )
    : messages;

  const isMyMessage = (msg) => {
    return msg.sender?._id === user?.id || msg.sender?.id === user?.id;
  };

  const renderContent = (msg) => {
    if (msg.type === "image") {
      return (
        <img
          src={msg.content}
          alt="shared"
          className="max-w-xs rounded-lg mt-1 cursor-pointer"
          onClick={() => window.open(msg.content, "_blank")}
        />
      );
    }
    if (msg.type === "file") {
      return (
        <a
          href={msg.content}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-blue-300 underline mt-1"
        >
          📎 Download file
        </a>
      );
    }
    return <p className="text-sm">{msg.content}</p>;
  };

  const renderReadReceipt = (msg) => {
    if (!isMyMessage(msg)) return null;
    if (msg.readBy && msg.readBy.length > 0) {
      return <p className="text-xs opacity-60 mt-0.5">✓✓ Seen</p>;
    }
    return <p className="text-xs opacity-60 mt-0.5">✓ Delivered</p>;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {filtered.map((msg, i) => (
          <div
            key={i}
            className={`flex ${isMyMessage(msg) ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMyMessage(msg) ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
            >
              {!isMyMessage(msg) && (
                <p className="text-xs text-blue-300 mb-1 font-semibold">
                  {msg.sender?.name}
                </p>
              )}
              {renderContent(msg)}
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {renderReadReceipt(msg)}
              {msg.reactions?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {msg.reactions.map((r, ri) => (
                    <span key={ri}>{r.emoji}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typingUser && (
          <div className="text-gray-400 text-sm italic">
            {typingUser} is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
