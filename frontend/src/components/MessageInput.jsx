import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const BACKEND_URL = "https://novchat-backend.onrender.com";

function MessageInput({ onSend, onTyping, token }) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message, "text");
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const isImage = file.type.startsWith("image/");
        onSend(data.url, isImage ? "image" : "file");
        toast.success("File uploaded!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Upload failed");
    }
    setUploading(false);
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
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="text-gray-400 hover:text-white text-xl"
          disabled={uploading}
        >
          📎
        </button>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <input
          type="text"
          value={uploading ? "Uploading..." : message}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={uploading}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
