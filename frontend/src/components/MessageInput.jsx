import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

function MessageInput({ onSend, onTyping }) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
    setShowEmoji(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="border-t border-gray-700 p-4">
      {showEmoji && (
        <div className="absolute bottom-20 left-64 z-10">
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-gray-400 hover:text-white text-2xl"
        >
          😊
        </button>
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
    </div>
  );
}

export default MessageInput;
