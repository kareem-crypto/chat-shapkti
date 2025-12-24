import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text: string;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatId] = useState("main");
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("joinChat", chatId);

    newSocket.on("newMessage", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on("updateMessage", (msg: Message) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
    });

    newSocket.on("removeMessage", (id: string) => {
      setMessages(prev => prev.filter(m => m._id !== id));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!username || !text) return alert("اكتب اسمك والرسالة");
    socket?.emit("sendMessage", { chatId, sender: username, text });
    setText("");
  };

  const deleteMessage = (id: string) => {
    socket?.emit("deleteMessage", { chatId, id });
  };

  const editMessage = (id: string) => {
    const newText = prompt("عدل رسالتك:");
    if (newText !== null && newText.trim() !== "") {
      socket?.emit("editMessage", { chatId, id, text: newText });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>شبكتي</h1>
      <input
        placeholder="اسمك"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 5 }}
      />
      <textarea
        placeholder="اكتب رسالتك"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 5 }}
      />
      <button onClick={sendMessage} style={{ padding: 10, width: "100%", marginBottom: 10 }}>
        أرسل
      </button>
      <div>
        {messages.map(m => (
          <div key={m._id} style={{ borderBottom: "1px solid #ccc", padding: 5 }}>
            <strong>{m.sender}:</strong> {m.text}
            <button onClick={() => editMessage(m._id)} style={{ marginLeft: 5 }}>✏️</button>
            <button onClick={() => deleteMessage(m._id)} style={{ marginLeft: 5 }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
