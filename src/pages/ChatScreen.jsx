import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp } from "react-icons/fa";
import axios from "axios";
import { Typewriter } from "react-simple-typewriter";

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const URL = import.meta.env.VITE_API_URL;

const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const existingSessionId = localStorage.getItem("newsMateSessionId");
    if (existingSessionId) {
      setSessionId(existingSessionId);
      fetchChatHistory(existingSessionId);
    } else {
      const newSessionId = generateSessionId();
      localStorage.setItem("newsMateSessionId", newSessionId);
      setSessionId(newSessionId);
      fetchChatHistory(newSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isTyping]);

  const fetchChatHistory = async (sessionIdParam = sessionId) => {
    try {
      const res = await axios.get(`${URL}/api/chat/${sessionIdParam}`);
      setMessages(res.data.history);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const userMsg = { role: "user", message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      await axios.post(`${URL}/api/chat`, {
        prompt: message,
        sessionId,
      });

      await fetchChatHistory();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = async () => {
    try {
      await axios.delete(`${URL}/api/chat/${sessionId}`);
      setMessages([]);
      localStorage.removeItem("newsMateSessionId");
      const newSessionId = generateSessionId();
      localStorage.setItem("newsMateSessionId", newSessionId);
      setSessionId(newSessionId);
      fetchChatHistory(newSessionId);
    } catch (err) {
      console.error("Error resetting chat:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-900">
      <div className="bg-gray-800 md:mx-60 mx-6 h-screen flex flex-col">
        <div className="bg-gray-900 text-blue-500 py-5 flex justify-between items-center">
          <span className="text-3xl text-gray-300 font-bold">NewsMate</span>
          <button
            onClick={handleResetChat}
            className="border-1 border-gray-600 text-gray-300 cursor-pointer hover:bg-gray-800 py-2 px-3 rounded-sm"
          >
            Reset Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex h-full justify-center items-center">
              <p className="text-gray-400">
                Hey there! What news are you curious about today? I’ve got you
                covered :)
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`p-4 max-w-lg rounded-md break-words ${
                    msg.role === "user"
                      ? "bg-gray-600 text-white text-right"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {msg.role !== "user" ? (
                    idx === messages.length - 1 ? (
                       <Typewriter
                        words={[msg.message]}
                        typeSpeed={5}
                        deleteSpeed={0}
                        delaySpeed={500}
                        onType={() => setIsTyping((prev) => !prev)}
                      />
                    ) : (
                      msg.message
                    )
                  ) : (
                    msg.message
                  )}
                </p>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <p className="bg-gray-600 p-4 text-gray-300 italic">
                AI is thinking...
              </p>               
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <div className="bg-gray-900 flex justify-between items-center pr-4">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full py-5 outline-0 px-3 rounded-sm bg-gray-900 text-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className={`bg-white rounded-full w-12 hover:bg-gray-100 h-11 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              } flex items-center justify-center ml-2`}
            >
              {loading ? (
                <>
                  <span className="loader"></span>
                </>
              ) : (
                <FaArrowUp size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
