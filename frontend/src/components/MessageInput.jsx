import { useState } from "react";

function MessageInput({ onSend, onTyping }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-700 flex gap-3"
    >
      <input
        type="text"
        value={message}
        onChange={handleChange}
        placeholder="Type a message..."
        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 font-semibold"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;
