import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ArrowLeft, MessageCircle, AlertCircle } from "lucide-react";
import api from "../services/api.js";

const LearnHubChat = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [post, setPost] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = async () => {
    try {
      const userRes = await api.get("/api/auth/me");
      setUser(userRes.data);
    } catch {
      navigate("/login");
    }
  };

  const loadChat = async () => {
    try {
      setLoading(true);
      const chatRes = await api.get(`/api/learnhub/${postId}/chat`);
      setChat(chatRes.data);
      
      const postRes = await api.get(`/api/learnhub?type=${chatRes.data.postId}`);
      const currentPost = postRes.data.find(p => String(p._id) === String(postId));
      setPost(currentPost);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadChat();
    }
  }, [user, postId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const updated = await api.post(`/api/learnhub/${postId}/chat/message`, {
        text: messageText,
      });
      setChat(updated.data);
      setMessageText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
            Loading chat...
          </p>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="container">
        <div 
          className="card"
          style={{ 
            textAlign: "center", 
            padding: "2rem",
            borderLeft: "4px solid var(--error)",
          }}
        >
          <AlertCircle size={32} style={{ color: "var(--error)", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.1rem", color: "var(--error)" }}>
            {error || "Chat not found"}
          </p>
          <button 
            type="button"
            className="btn-accent"
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/learnhub")}
          >
            Back to LearnHub
          </button>
        </div>
      </div>
    );
  }

  const isCreator = String(user._id) === String(chat.creatorId?._id);
  const otherUser = isCreator ? chat.acceptedUserId : chat.creatorId;
  const userRole = isCreator ? "Teacher" : "Learner";
  const otherRole = isCreator ? "Learner" : "Teacher";

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem" }}>
        <button
          type="button"
          onClick={() => navigate("/learnhub")}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ArrowLeft size={18} />
          Back to LearnHub
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <MessageCircle size={32} />
          Conversation
        </h1>
      </div>

      {post && (
        <div className="card" style={{ marginBottom: "2rem", background: "var(--secondary)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{post.title}</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            {post.description}
          </p>
          {post.price && (
            <p style={{ color: "var(--accent)", fontWeight: "600" }}>
              Fee: ₹{post.price}/session
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ display: "flex", flexDirection: "column", height: "500px" }}>
        <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ marginTop: 0 }}>
            Chatting with {otherUser?.name} ({otherRole})
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 0 }}>
            You are the {userRole}
          </p>
          {!chat.isActive && (
            <p style={{ color: "var(--error)", fontSize: "0.9rem", marginBottom: 0 }}>
              ⚠️ Chat is inactive
            </p>
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: "1rem",
            paddingRight: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {chat.messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", margin: "auto" }}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            chat.messages.map((msg, idx) => {
              const isSender = String(msg.senderId._id) === String(user._id);
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      backgroundColor: isSender ? "var(--accent)" : "var(--secondary)",
                      color: isSender ? "white" : "var(--text-primary)",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      wordWrap: "break-word",
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: "0.25rem", fontWeight: "500", fontSize: "0.9rem" }}>
                      {isSender ? "You" : msg.senderId?.name || "Unknown"}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>
                      {msg.text}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        marginTop: "0.25rem",
                        fontSize: "0.75rem",
                        opacity: 0.7,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {chat.isActive ? (
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--secondary)",
                color: "var(--text-primary)",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              className="btn-accent"
              style={{
                width: "auto",
                padding: "0.75rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Send size={18} />
              Send
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--secondary)",
              borderRadius: "8px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ marginBottom: 0 }}>Chat is closed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnHubChat;
