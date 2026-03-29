import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ConceptOrbit from "./ConceptOrbit";
import "./SubjectSelection.css";

const subjects = [
  { id: "DSA", name: "Data Structures & Algorithms", short: "DSA", icon: "⟨/⟩", color: "#BF5AF2", description: "Arrays, Trees, Graphs, Recursion, Sorting, Searching, and Dynamic Programming", concepts: 12 },
  { id: "OS", name: "Operating Systems", short: "OS", icon: "⚙️", color: "#0A84FF", description: "Processes, Threads, Scheduling, Synchronization, Deadlocks, and Memory Management", concepts: 9 },
  { id: "DBMS", name: "Database Management", short: "DBMS", icon: "🗃️", color: "#30D158", description: "Tables, Keys, Joins, Normalization, Transactions, and Indexing", concepts: 9 },
];

const EDUCATION_LEVELS = [
  { id: "school", label: "School", icon: "🏫", color: "#f472b6", desc: "Classes 6–12, basics & fundamentals" },
  { id: "college", label: "College", icon: "🎒", color: "#60a5fa", desc: "Diploma & intermediate level" },
  { id: "undergraduate", label: "Undergraduate", icon: "📚", color: "#c084fc", desc: "Bachelor's degree courses" },
  { id: "graduate", label: "Graduate", icon: "🎓", color: "#34d399", desc: "Master's & postgraduate level" },
  { id: "phd", label: "PhD", icon: "🔬", color: "#f59e0b", desc: "Research & doctoral level" },
];

const SUBJECT_SUGGESTIONS = {
  school: ["Mathematics", "Physics", "Chemistry", "Biology", "English Grammar", "History", "Geography", "Computer Science", "Environmental Science", "Economics", "Political Science", "Hindi", "Algebra", "Geometry", "Trigonometry", "Organic Chemistry", "Mechanics"],
  college: ["Calculus", "Linear Algebra", "Statistics", "Economics", "Psychology", "Sociology", "Philosophy", "Political Science", "Accounting", "Business Studies", "Engineering Drawing", "Communication Skills", "Environmental Studies", "Data Analysis", "Financial Management"],
  undergraduate: ["Data Structures & Algorithms", "Operating Systems", "Database Management", "Computer Networks", "Software Engineering", "Digital Electronics", "Machine Learning", "Discrete Mathematics", "Organic Chemistry", "Thermodynamics", "Microeconomics", "Macroeconomics", "Linear Algebra", "Probability & Statistics", "Signal Processing", "Control Systems", "Artificial Intelligence", "Web Development", "Compiler Design", "Theory of Computation", "Electromagnetic Theory", "Fluid Mechanics"],
  graduate: ["Advanced Algorithms", "Distributed Systems", "Natural Language Processing", "Computer Vision", "Deep Learning", "Cloud Computing", "Cryptography", "Information Theory", "Advanced Database Systems", "Robotics", "Quantum Computing", "Data Mining", "Parallel Computing", "Advanced Operating Systems", "Network Security", "Big Data Analytics", "Reinforcement Learning", "Game Theory", "Advanced Statistics"],
  phd: ["Research Methodology", "Advanced Statistical Methods", "Computational Complexity", "Quantum Information", "Theoretical CS", "Advanced Machine Learning", "Bayesian Methods", "Causal Inference", "Formal Verification", "Type Theory", "Category Theory", "Advanced Cryptography", "Computational Biology", "Neuroinformatics", "Optimization Theory", "Information Geometry"],
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

export default function SubjectSelection() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const suggestions = selectedEducation
    ? (SUBJECT_SUGGESTIONS[selectedEducation.id] || []).filter(s => s.toLowerCase().includes(subjectInput.toLowerCase()))
    : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (wizardStep === 2 && inputRef.current) setTimeout(() => inputRef.current.focus(), 350); }, [wizardStep]);

  const handleEducationSelect = (edu) => { setSelectedEducation(edu); setSubjectInput(""); setTimeout(() => setWizardStep(2), 200); };
  const handleSubjectSelect = (subject) => { setSubjectInput(subject); setShowSuggestions(false); };
  const handleStartCustomQuiz = () => { if (!subjectInput.trim()) return; navigate("/quiz/custom", { state: { educationLevel: selectedEducation, customSubject: subjectInput.trim() } }); };
  const handleCloseWizard = () => { setShowWizard(false); setWizardStep(1); setSelectedEducation(null); setSubjectInput(""); };
  const handleOpenWizard = () => { setShowWizard(true); setWizardStep(1); setSelectedEducation(null); setSubjectInput(""); };

  return (
    <div className="ss-root">
      {/* Nav */}
      <nav className="ss-nav">
        <div className="ss-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="rgba(10,132,255,0.12)"/>
            <path d="M9 11h14M9 16h10M9 21h7" stroke="#0A84FF" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="22" cy="21" r="4" fill="rgba(191,90,242,0.2)" stroke="#BF5AF2" strokeWidth="1.5"/>
            <path d="M20.5 21l1.2 1.2L23.5 19.5" stroke="#BF5AF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ss-brand-text">LearnLens <span className="ss-brand-ai">AI</span></span>
        </div>
        <div className="ss-user">
          <div className="ss-user-info">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="ss-avatar" /> : (
              <div className="ss-avatar-placeholder">{(user?.displayName || user?.email || "U")[0].toUpperCase()}</div>
            )}
            <span className="ss-user-name">{user?.displayName || user?.email}</span>
          </div>
          <button className="ss-logout" onClick={signOut}>Sign Out</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="ss-hero">
        {/* Left */}
        <motion.div className="ss-hero-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="ss-eyebrow">
            <div className="ss-eyebrow-dot" />
            Root Cause Learning Diagnosis
          </div>
          <h1 className="ss-title">
            Understand <span className="ss-title-colored">WHY</span> You Fail — Not Just What
          </h1>
          <p className="ss-desc">
            Our AI pinpoints the foundational knowledge gaps holding you back, analyzes your behavioral patterns, and creates a personalized learning path.
          </p>
          <div className="ss-hero-actions">
            <button className="ss-btn-primary" onClick={() => document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth' })} id="start-learning-btn">
              Start Learning →
            </button>
            <button className="ss-btn-secondary" onClick={handleOpenWizard} id="try-demo-btn">
              ✨ Custom Topic
            </button>
          </div>
          <div className="ss-stats-row">
            {[{ num: "3+", label: "Core subjects" }, { num: "AI", label: "Generated questions" }, { num: "100%", label: "Root cause accuracy" }].map((s, i) => (
              <motion.div key={i} className="ss-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}>
                <span className="ss-stat-num">{s.num}</span>
                <span className="ss-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Neural Brain Visual */}
        <motion.div className="ss-hero-right"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <div className="ss-spline-wrap">
            <ConceptOrbit />
          </div>
        </motion.div>
      </section>

      {/* Subjects Section */}
      <section className="ss-subjects-section" id="subjects-section">
        <motion.div className="ss-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h2 className="ss-section-title">Choose Your Subject</h2>
          <p className="ss-section-desc">Select a subject to begin your AI-powered diagnostic assessment</p>
        </motion.div>

        <div className="ss-grid">
          {subjects.map((s, i) => (
            <motion.div key={s.id} className="ss-card" style={{ "--accent": `${s.color}18` }}
              variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              whileHover={{ y: -6, boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px ${s.color}30` }}
              onClick={() => navigate(`/quiz/${s.id}`)} id={`subject-${s.id}`}>
              <div className="ss-card-accent-bar" style={{ background: s.color }} />
              <div className="ss-card-icon">{s.icon}</div>
              <h2 className="ss-card-title">{s.name}</h2>
              <p className="ss-card-desc">{s.description}</p>
              <div className="ss-card-meta">
                <span className="ss-card-concepts">{s.concepts} concepts</span>
                <span className="ss-card-badge" style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}10` }}>Diagnostic Quiz</span>
              </div>
              <button className="ss-card-btn" style={{ "--accent": s.color }}>Start Diagnosis →</button>
            </motion.div>
          ))}

          <motion.div className="ss-card ss-card-custom" style={{ "--accent": "rgba(245,158,11,0.08)" }}
            variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
            whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2)" }}
            onClick={handleOpenWizard} id="subject-custom">
            <div className="ss-card-accent-bar" style={{ background: "#FF9F0A" }} />
            <div className="ss-card-icon">✨</div>
            <h2 className="ss-card-title">Custom Topic</h2>
            <p className="ss-card-desc">Choose your education level and enter any subject — AI will generate a personalized diagnostic quiz just for you.</p>
            <div className="ss-card-meta">
              <span className="ss-card-concepts">Any subject</span>
              <span className="ss-card-badge" style={{ color: "#FF9F0A", borderColor: "rgba(255,159,10,0.3)", background: "rgba(255,159,10,0.08)" }}>Personalized</span>
            </div>
            <button className="ss-card-btn" style={{ "--accent": "#FF9F0A" }}>Create Your Quiz ✨</button>
          </motion.div>
        </div>
      </section>

      {/* Wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div className="ss-wizard-overlay" onClick={handleCloseWizard}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="ss-wizard-panel" onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <button className="ss-wizard-close" onClick={handleCloseWizard}>✕</button>

              <div className="ss-wizard-steps">
                <div className={`ss-wizard-step-dot ${wizardStep >= 1 ? "active" : ""}`}><span>1</span></div>
                <div className={`ss-wizard-step-line ${wizardStep >= 2 ? "active" : ""}`} />
                <div className={`ss-wizard-step-dot ${wizardStep >= 2 ? "active" : ""}`}><span>2</span></div>
              </div>

              <div className={`ss-wizard-content ${wizardStep === 1 ? "visible" : "hidden-left"}`}>
                <h2 className="ss-wizard-title">What's your education level?</h2>
                <p className="ss-wizard-subtitle">This helps us calibrate question difficulty and depth.</p>
                <div className="ss-edu-grid">
                  {EDUCATION_LEVELS.map((edu, i) => (
                    <button key={edu.id} className={`ss-edu-card ${selectedEducation?.id === edu.id ? "selected" : ""}`}
                      style={{ "--edu-color": edu.color, animationDelay: `${i * 0.06}s` }}
                      onClick={() => handleEducationSelect(edu)} id={`edu-${edu.id}`}>
                      <span className="ss-edu-icon">{edu.icon}</span>
                      <span className="ss-edu-label">{edu.label}</span>
                      <span className="ss-edu-desc">{edu.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`ss-wizard-content ${wizardStep === 2 ? "visible" : "hidden-right"}`}>
                <button className="ss-wizard-back" onClick={() => setWizardStep(1)}>← Back</button>
                <h2 className="ss-wizard-title">What subject do you want to study?</h2>
                <p className="ss-wizard-subtitle">
                  Type your subject or pick from suggestions for{" "}
                  <span className="ss-wizard-edu-badge" style={{ color: selectedEducation?.color }}>
                    {selectedEducation?.icon} {selectedEducation?.label}
                  </span>
                </p>
                <div className="ss-subject-input-wrap">
                  <input ref={inputRef} type="text" className="ss-subject-input"
                    placeholder="e.g. Organic Chemistry, Machine Learning..."
                    value={subjectInput}
                    onChange={e => { setSubjectInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={e => { if (e.key === "Enter" && subjectInput.trim()) handleStartCustomQuiz(); }}
                    id="subject-input" />
                  <span className="ss-subject-input-icon">🔍</span>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="ss-suggestions" ref={suggestionsRef}>
                      {suggestions.slice(0, 8).map((s, i) => (
                        <button key={i} className="ss-suggestion-item" onClick={() => handleSubjectSelect(s)}>
                          <span>📘</span><span>{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!subjectInput && selectedEducation && (
                  <div className="ss-popular">
                    <span className="ss-popular-label">Popular choices:</span>
                    <div className="ss-popular-chips">
                      {(SUBJECT_SUGGESTIONS[selectedEducation.id] || []).slice(0, 6).map((s, i) => (
                        <button key={i} className="ss-popular-chip" onClick={() => handleSubjectSelect(s)} style={{ animationDelay: `${i * 0.05}s` }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {subjectInput.trim() && (
                  <div className="ss-summary-card">
                    <div className="ss-summary-row">
                      <span className="ss-summary-label">Education</span>
                      <span className="ss-summary-value" style={{ color: selectedEducation?.color }}>{selectedEducation?.icon} {selectedEducation?.label}</span>
                    </div>
                    <div className="ss-summary-row">
                      <span className="ss-summary-label">Subject</span>
                      <span className="ss-summary-value">{subjectInput}</span>
                    </div>
                    <button className="ss-start-btn" onClick={handleStartCustomQuiz} id="start-custom-quiz">🚀 Continue to Quiz Setup</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="ss-footer">
        <p>LearnLens uses concept dependency graphs and multi-signal analysis for accurate root cause diagnosis.</p>
      </footer>
    </div>
  );
}
