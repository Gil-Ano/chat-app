require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_online", async (userId) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create({
        sender: data.senderId,
        room: data.room,
        content: data.content,
        type: data.type || "text",
      });
      const populated = await message.populate("sender", "name avatar");
      io.to(data.room).emit("receive_message", populated);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("send_dm", async (data) => {
    try {
      const message = await Message.create({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content,
        type: data.type || "text",
      });
      const populated = await message.populate("sender", "name avatar");
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_dm", populated);
      }
      socket.emit("receive_dm", populated);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("user_stop_typing", data);
  });

  socket.on("message_read", async (data) => {
    await Message.findByIdAndUpdate(data.messageId, {
      $addToSet: { readBy: data.userId },
    });
    io.to(data.room).emit("message_read_update", data);
  });

  socket.on("react_message", async (data) => {
    io.to(data.room).emit("reaction_update", data);
  });

  socket.on("disconnect", async () => {
    let disconnectedUser;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUser) {
      await User.findByIdAndUpdate(disconnectedUser, { isOnline: false });
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Chat API running" });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
