import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://novchat-backend.onrender.com";

function Sidebar({
  rooms,
  users,
  activeRoom,
  setActiveRoom,
  activeDM,
  setActiveDM,
  onCreateRoom,
  unreadCounts,
}) {
  const { user, token, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const handleBlock = async (userId) => {
    await fetch(`${BACKEND_URL}/api/users/block/${userId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("User blocked");
  };

  const handleUnblock = async (userId) => {
    await fetch(`${BACKEND_URL}/api/users/unblock/${userId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("User unblocked");
  };

  return (
    <div className="w-64 bg-gray-800 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-white font-bold text-xl">NovChat 💬</h1>
        <p className="text-gray-400 text-sm mt-1">Hi, {user?.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Rooms
            </span>
            <button
              onClick={onCreateRoom}
              className="text-gray-400 hover:text-white text-lg"
            >
              +
            </button>
          </div>
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => {
                setActiveRoom(room);
                setActiveDM(null);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 flex justify-between items-center ${activeRoom?._id === room._id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
            >
              <span># {room.name}</span>
              {unreadCounts?.[room.name] > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCounts[room.name]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Direct Messages
          </span>
          {users.map((u) => (
            <div key={u._id} className="group relative">
              <button
                onClick={() => {
                  setActiveDM(u);
                  setActiveRoom(null);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm mb-1 flex items-center gap-2 mt-1 ${activeDM?._id === u._id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${onlineUsers.includes(u._id) ? "bg-green-400" : "bg-gray-500"}`}
                ></span>
                <span className="flex-1">{u.name}</span>
                {unreadCounts?.[u._id] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCounts[u._id]}
                  </span>
                )}
              </button>
              <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                <button
                  onClick={() => handleBlock(u._id)}
                  className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded hover:bg-red-500"
                >
                  Block
                </button>
                <button
                  onClick={() => handleUnblock(u._id)}
                  className="text-xs bg-gray-600 text-white px-1.5 py-0.5 rounded hover:bg-gray-500"
                >
                  Unblock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-400 hover:text-white text-sm px-3 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
