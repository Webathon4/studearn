import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Send, XCircle } from "lucide-react";
import api from "../services/api.js";

const Chat = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const normalizeId = (value) => (typeof value === "string" ? value : value?._id);

  const loadChat = async () => {
    try {
      const res = await api.get(`/api/chats/${chatId}`);
      setChat(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat");
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user");
    }
  };

  useEffect(() => {
    loadChat();
    loadUser();
  }, [chatId]);

  const handleSend = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const res = await api.post(`/api/chats/${chatId}/messages`, { text: message });
      setChat(res.data);
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          <MessageSquare size={32} />
          Chat
        </h1>
        <p className="page-description">Discuss task details with the host/student</p>
      </div>

      {error && <p className="error alert alert-danger"><XCircle size={18} /> {error}</p>}

      <div className="chat-shell">
        <div className="chat-window">
          {chat?.messages?.length ? (
            chat.messages.map((msg, index) => {
              const senderId = normalizeId(msg.senderId);
              const isSelf = senderId && user?._id && senderId === user._id;
              const hostId = normalizeId(chat.hostId);
              const senderLabel = isSelf
                ? "You"
                : senderId && hostId && senderId === hostId
                  ? "Host"
                  : "Student";

              return (
                <div
                  key={`${senderId || "sender"}-${msg.timestamp}-${index}`}
                  className={`chat-row ${isSelf ? "chat-row--self" : ""}`}
                >
                  <div className={`chat-bubble ${isSelf ? "chat-bubble--self" : ""}`}>
                    <div className="chat-sender">{senderLabel}</div>
                    <div className="chat-text">{msg.text}</div>
                    <div className="chat-time">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>No messages yet.</p>
          )}
        </div>

        <form onSubmit={handleSend} className="chat-input">
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={!chat || !chat.isActive}
            placeholder={chat?.isActive ? "Type your message" : "Chat disabled"}
          />
          <button type="submit" disabled={!chat || !chat.isActive || !message.trim()}>
            Send Message
          </button>
        </form>
      </div>

      {chat && !chat.isActive && (
        <p className="warning alert alert-warning">Chat closed. Application rejected.</p>
      )}

    </div>
  );
};

export default Chat;
