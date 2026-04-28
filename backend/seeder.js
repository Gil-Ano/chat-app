require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

const rooms = [
  { name: "general", description: "General discussion for everyone" },
  { name: "tech", description: "Technology and programming talk" },
  { name: "random", description: "Random conversations" },
  { name: "jobs", description: "Job opportunities and career advice" },
  { name: "zimbabwe", description: "Zimbabwe community chat" },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await Room.deleteMany();
    await Room.insertMany(rooms);
    console.log("5 rooms seeded");
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
