import React, { useState, useRef, useEffect } from "react";
import { chatWithTutor } from "../services/groqService";
import "./ChatPanel.css";

const SUGGESTED_QUESTIONS = [
  "Why is {rootCause} my weakest area?",
  "What should I study first?",
  "Can you explain {rootCause} simply?",
  "How are my weak concepts connected?",
  "Give me a study plan for this week",
];

export default function ChatPanel({ diagnosisContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const isSpeakingEnabledRef = useRef(isSpeakingEnabled); // Ref to avoid closure stales
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(""); // Track current spoken string for auto-send
  const sendMessageRef = useRef(null); // Ref for the latest sendMessage closure

  const rootCause = diagnosisContext?.rootCause?.concept || "the weak concept";

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting = `Hi! 👋 I'm your LearnLens AI Tutor. I've analyzed your ${diagnosisContext?.subject || ""} diagnosis and I'm ready to help you understand your results. Ask me anything about your weak areas, learning path, or any concept you'd like explained!`;
    setMessages([{ role: "assistant", content: greeting }]);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop automatically when user stops speaking
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join("");
        setInput(transcript);
        transcriptRef.current = transcript; // Constantly update ref
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically send message when voice stops decoding
        if (transcriptRef.current?.trim()) {
           sendMessageRef.current?.(transcriptRef.current);
           transcriptRef.current = ""; // Reset after dispatch
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput(""); 
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeaker = () => {
    const nextState = !isSpeakingEnabled;
    setIsSpeakingEnabled(nextState);
    isSpeakingEnabledRef.current = nextState;
    
    // Immediately stop talking if the user just toggled it OFF
    if (!nextState && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    if (!isSpeakingEnabledRef.current) return; // Prevent if disabled

    // Strip basic markdown syntax so the voice doesn't read special characters out loud
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*(.*?)\*/g, '$1')
                        .replace(/#(.*?)\n/g, '$1\n')
                        .replace(/[•`-]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithTutor(text.trim(), diagnosisContext, chatHistory);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      
      // Attempt to read the AI's response aloud
      speakText(response);
      
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again. 🔄",
      }]);
      speakText("Sorry, I couldn't process that. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Keep sendMessageRef updated so onend closure always has the latest messages array closure
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (q) => {
    const processed = q.replace("{rootCause}", rootCause);
    sendMessage(processed);
  };

  return (
    <div className="cp-container" id="chat-panel">
      <div className="cp-header">
        <div className="cp-header-icon">🤖</div>
        <div>
          <h3 className="cp-header-title">AI Learning Tutor</h3>
          <p className="cp-header-sub">Ask about your diagnosis & concepts</p>
        </div>
      </div>

      {/* Messages */}
      <div className="cp-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`cp-msg cp-msg-${msg.role}`}>
            {msg.role === "assistant" && <div className="cp-msg-avatar">🤖</div>}
            <div className="cp-msg-bubble">
              <div className="cp-msg-content">{formatMessage(msg.content)}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="cp-msg cp-msg-assistant">
            <div className="cp-msg-avatar">🤖</div>
            <div className="cp-msg-bubble">
              <div className="cp-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="cp-suggestions">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              className="cp-suggestion-btn"
              onClick={() => handleSuggestion(q)}
            >
              {q.replace("{rootCause}", rootCause)}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="cp-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="cp-input"
          placeholder="Ask about your diagnosis..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          id="chat-input"
        />
        
        {speechSupported && (
          <button
            type="button"
            className={`cp-mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleListening}
            disabled={loading}
            title="Use Voice Input"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
        )}

        {/* Text-to-Speech Toggle Button */}
        <button
          type="button"
          className={`cp-speaker-btn ${isSpeakingEnabled ? "active" : ""}`}
          onClick={toggleSpeaker}
          title={isSpeakingEnabled ? "Mute Voice Output" : "Enable Voice Output"}
        >
          {isSpeakingEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          )}
        </button>

        <button
          type="submit"
          className="cp-send-btn"
          disabled={!input.trim() || loading}
          id="chat-send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function formatMessage(text) {
  // Simple markdown-like formatting
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="cp-bold">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <p key={i} className="cp-list-item">• {line.slice(2)}</p>;
    }
    if (line.trim() === "") return <br key={i} />;
    // Bold inline
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <p key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </p>
      );
    }
    return <p key={i}>{line}</p>;
  });
}
