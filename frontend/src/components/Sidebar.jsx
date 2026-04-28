import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Sidebar({
  rooms,
  users,
  activeRoom,
  setActiveRoom,
  activeDM,
  setActiveDM,
  onCreateRoom,
}) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:5002/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    logout();
    toast.success("Logged out");
    navigate("/login");
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
              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${activeRoom?._id === room._id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
            >
              # {room.name}
            </button>
          ))}
        </div>

        <div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Direct Messages
          </span>
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => {
                setActiveDM(u);
                setActiveRoom(null);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 flex items-center gap-2 mt-1 ${activeDM?._id === u._id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${onlineUsers.includes(u._id) ? "bg-green-400" : "bg-gray-500"}`}
              ></span>
              {u.name}
            </button>
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
