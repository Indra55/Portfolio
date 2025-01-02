import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import user from "../assets/user-profile.png"
import me from "../assets/profilepic.jpg"
 
const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setTyping(true);
      const timer = setTimeout(() => setTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", text: query },
    ]);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5555/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", text: "Sorry, something went wrong." },
      ]);
    }

    setQuery("");
    setLoading(false);
  };

  return (
    <div className="h-[980px] w-[888px] text-white bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#f8c3b8] font-[Silkscreen]">
          Talk to the Virtual Me!
        </h1>
      </div>
       <div className="h-full flex flex-col">
        <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full space-y-6 text-center">
              <div className="bg-white bg-opacity-10 p-8 rounded-full">
                <MessageCircle size={48} className="text-[#f8c3b8]" />
              </div>
              <div className="space-y-3 max-w-md scale-[130%]">
                <h2 className="text-xl font-semibold text-[#f8c3b8] ">
                  Ready to Chat!
                </h2>
                {typing ? (
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 ">
                      Ask me anything! I'm the Virtual twin of Hitanshu!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-4">
                      {["How can you help me?", "Tell me about yourself", "What can you do?"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setQuery(suggestion);
                            sendMessage();
                          }}
                          className="px-4 py-2 bg-white bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={msg.type === "user" ? user: me}
                    alt={`${msg.type} Icon`}
                    className="w-8 h-8 rounded-full bg-white border-2 border-white"
                  />
                  <div className={`p-3 rounded-xl max-w-[70%] ${
                    msg.type === "user" ? "rounded-l-xl" : "rounded-r-xl"
                  } text-lg`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center mt-4 space-x-2">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyPress}
            className="w-full p-3 bg-white bg-opacity-20 backdrop-blur-lg text-white rounded-xl"
            placeholder="Ask something..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-3 bg-[#f8c3b8] rounded-xl text-black text-bold disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;