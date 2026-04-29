import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import toast from "react-hot-toast";

function ChatPage() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetch("http://localhost:5002/api/rooms", { headers })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setActiveRoom(data[0]);
      });

    fetch("http://localhost:5002/api/users", { headers })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit("user_online", user.id);
    }
  }, [socket, user]);

  useEffect(() => {
    if (!activeRoom) return;
    socket?.emit("join_room", activeRoom.name);
    setUnreadCounts((prev) => ({ ...prev, [activeRoom.name]: 0 }));
    fetch(`http://localhost:5002/api/messages/${activeRoom.name}`, { headers })
      .then((res) => res.json())
      .then(setMessages);
  }, [activeRoom]);

  useEffect(() => {
    if (!activeDM) return;
    setUnreadCounts((prev) => ({ ...prev, [activeDM._id]: 0 }));
    fetch(`http://localhost:5002/api/messages/direct/${activeDM._id}`, {
      headers,
    })
      .then((res) => res.json())
      .then(setMessages);
  }, [activeDM]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.room !== activeRoom?.name) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.room]: (prev[message.room] || 0) + 1,
        }));
      }
    });

    socket.on("receive_dm", (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender?._id !== activeDM?._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender?._id]: (prev[message.sender?._id] || 0) + 1,
        }));
      }
    });

    socket.on("user_typing", (data) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_dm");
      socket.off("user_typing");
    };
  }, [socket, activeRoom, activeDM]);

  const handleSend = (content, type = "text") => {
    if (!socket) return;
    if (activeRoom) {
      socket.emit("send_message", {
        senderId: user.id,
        room: activeRoom.name,
        content,
        type,
      });
    } else if (activeDM) {
      socket.emit("send_dm", {
        senderId: user.id,
        receiverId: activeDM._id,
        content,
        type,
      });
    }
  };

  const handleTyping = () => {
    if (!socket || !activeRoom) return;
    socket.emit("typing", { room: activeRoom.name, userName: user.name });
  };

  const handleCreateRoom = async () => {
    const name = prompt("Enter room name:");
    if (!name) return;
    const res = await fetch("http://localhost:5002/api/rooms", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, description: "" }),
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((prev) => [...prev, data]);
      toast.success(`Room #${name} created!`);
    } else {
      toast.error(data.message);
    }
  };

  const title = activeRoom
    ? `# ${activeRoom.name}`
    : activeDM
      ? `@ ${activeDM.name}`
      : "Select a room";

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        rooms={rooms}
        users={users}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
        activeDM={activeDM}
        setActiveDM={setActiveDM}
        onCreateRoom={handleCreateRoom}
        unreadCounts={unreadCounts}
      />
      <div className="flex-1 flex flex-col">
        {activeRoom || activeDM ? (
          <>
            <ChatWindow
              messages={messages}
              typingUser={typingUser}
              title={title}
            />
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              token={token}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a room or user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
