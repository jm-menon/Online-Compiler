import { useState } from "react";
import axios from "axios";

function Chatbot({ code }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post("http://localhost:8080/api/ai", {
        code: code || "// No code provided",
        prompt: message
      });

      const botMsg = { sender: "bot", text: res.data.reply };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error contacting AI service." }
      ]);
    }

    setMessage("");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px 16px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px"
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "300px",
            height: "400px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              fontWeight: "bold"
            }}
          >
            AI Assistant
          </div>

          <div
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "10px"
  }}
>
  {messages.map((m, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
        marginBottom: "10px" // ✅ spacing between bubbles
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "8px 12px",
          borderRadius:
            m.sender === "user"
              ? "12px 12px 0 12px"
              : "12px 12px 12px 0",
          background:
            m.sender === "user" ? "#2563eb" : "#f1f5f9",
          color: m.sender === "user" ? "white" : "black",
          fontSize: "14px",
          wordBreak: "break-word",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        {m.text}
      </div>
    </div>
  ))}
</div>

          <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1, padding: "8px", border: "none" }}
              placeholder="Ask something..."
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "8px",
                background: "#2563eb",
                color: "white",
                border: "none"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;