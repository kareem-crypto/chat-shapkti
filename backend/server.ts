import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// موديل الرسائل
import { Schema, model } from "mongoose";
const MessageSchema = new Schema({
  chatId: String,
  sender: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = model("Message", MessageSchema);

// Connect MongoDB
mongoose.connect("mongodb://localhost:27017/shabakti");

// Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("sendMessage", async (data) => {
    const message = await Message.create(data);
    io.to(data.chatId).emit("newMessage", message);
  });

  socket.on("editMessage", async (data) => {
    const message = await Message.findByIdAndUpdate(data.id, { text: data.text }, { new: true });
    io.to(data.chatId).emit("updateMessage", message);
  });

  socket.on("deleteMessage", async (data) => {
    await Message.findByIdAndDelete(data.id);
    io.to(data.chatId).emit("removeMessage", data.id);
  });
});

server.listen(3000, () => console.log("Backend running on port 3000"));
