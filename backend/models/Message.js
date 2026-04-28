const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: { type: String },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    type: { type: String, default: "text", enum: ["text", "image", "file"] },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [{ user: mongoose.Schema.Types.ObjectId, emoji: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
