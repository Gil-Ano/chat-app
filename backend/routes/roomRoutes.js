const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "name");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const exists = await Room.findOne({ name });
    if (exists) return res.status(400).json({ message: "Room already exists" });
    const room = await Room.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
