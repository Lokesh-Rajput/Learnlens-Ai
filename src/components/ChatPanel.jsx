import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const isSpeakingEnabledRef = useRef(isSpeakingEnabled);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const sendMessageRef = useRef(null);

  const rootCause = diagnosisContext?.rootCause?.concept || "the weak concept";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const greeting = `Hi! 👋 I'm your LearnLens AI Tutor. I've analyzed your ${diagnosisContext?.subject || ""} diagnosis and I'm ready to help you understand your results. Ask me anything about your weak areas, learning path, or any concept you'd like explained!`;
    setMessages([{ role: "assistant", content: greeting }]);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0]).map(r => r.transcript).join("");
        setInput(transcript);
        transcriptRef.current = transcript;
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => { setIsListening(false); if (transcriptRef.current?.trim()) { sendMessageRef.current?.(transcriptRef.current); transcriptRef.current = ""; } };
      recognitionRef.current = recognition;
    } else setSpeechSupported(false);
  }, []);

  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); } else { setInput(""); recognitionRef.current?.start(); setIsListening(true); } };
  const toggleSpeaker = () => { const next = !isSpeakingEnabled; setIsSpeakingEnabled(next); isSpeakingEnabledRef.current = next; if (!next && "speechSynthesis" in window) window.speechSynthesis.cancel(); };

  const speakText = (text) => {
    if (!("speechSynthesis" in window) || !isSpeakingEnabledRef.current) return;
    window.speechSynthesis.cancel();
    let cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#(.*?)\n/g, "$1\n").replace(/[•`-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

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
      speakText(response);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again. 🔄" }]);
      speakText("Sorry, I couldn't process that. Please try again.");
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
  const handleSuggestion = (q) => sendMessage(q.replace("{rootCause}", rootCause));

  return (
    <div className="cp-container" id="chat-panel">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-icon">🤖</div>
        <div>
          <h3 className="cp-header-title">AI Learning Tutor</h3>
          <p className="cp-header-sub">Ask about your diagnosis & concepts</p>
        </div>
        <div className="cp-header-status">
          <div className="cp-status-dot" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="cp-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} className={`cp-msg cp-msg-${msg.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              {msg.role === "assistant" && <div className="cp-msg-avatar">🤖</div>}
              <div className="cp-msg-bubble">
                <div className="cp-msg-content">{formatMessage(msg.content)}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div className="cp-msg cp-msg-assistant"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cp-msg-avatar">🤖</div>
            <div className="cp-msg-bubble">
              <div className="cp-typing"><span /><span /><span /></div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="cp-suggestions">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} className="cp-suggestion-btn" onClick={() => handleSuggestion(q)}>
              {q.replace("{rootCause}", rootCause)}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="cp-input-form" onSubmit={handleSubmit}>
        <input ref={inputRef} type="text" className="cp-input" placeholder="Ask about your diagnosis..."
          value={input} onChange={e => setInput(e.target.value)} disabled={loading} id="chat-input" />

        {speechSupported && (
          <button type="button" className={`cp-mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleListening} disabled={loading} title="Voice Input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        )}

        <button type="button" className={`cp-speaker-btn ${isSpeakingEnabled ? "active" : ""}`}
          onClick={toggleSpeaker} title={isSpeakingEnabled ? "Mute" : "Unmute"}>
          {isSpeakingEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </button>

        <button type="submit" className="cp-send-btn" disabled={!input.trim() || loading} id="chat-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

function formatMessage(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="cp-bold">{line.slice(2, -2)}</p>;
    if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} className="cp-list-item">• {line.slice(2)}</p>;
    if (line.trim() === "") return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) return <p key={i}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
    return <p key={i}>{line}</p>;
  });
}
