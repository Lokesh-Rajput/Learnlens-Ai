import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./LoginPage.css";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show
      ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
      : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const getFriendlyError = (code) => {
  const errors = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/popup-blocked": "Popup blocked — please allow popups.",
    "auth/too-many-requests": "Too many attempts. Please wait.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/operation-not-allowed": "Google sign-in not enabled in Firebase.",
    "auth/unauthorized-domain": "Domain not authorised in Firebase Console.",
  };
  return errors[code] || `An error occurred (${code}).`;
};

const features = [
  { icon: "🎯", text: "Root cause detection across concept dependencies" },
  { icon: "🤖", text: "AI-generated adaptive quizzes for any subject" },
  { icon: "📊", text: "Behavioral analysis — guessing vs. confusion vs. mastery" },
  { icon: "🛤️", text: "Personalized learning path with prerequisites" },
];

export default function LoginPage() {
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); clearMessages();
    try { await signInWithGoogle(); setSuccess("Signed in with Google! 🎉"); }
    catch (err) { setError(getFriendlyError(err.code)); }
    finally { setGoogleLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setSuccess("Reset email sent! Check your inbox 📧");
        setMode("login");
      } else if (mode === "register") {
        if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
        await registerWithEmail(email, password);
        setSuccess("Account created! 🎉");
      } else {
        await signInWithEmail(email, password);
        setSuccess("Welcome back! 👋");
      }
    } catch (err) { setError(getFriendlyError(err.code)); }
    finally { setLoading(false); }
  };

  const switchMode = (newMode) => {
    setMode(newMode); clearMessages();
    setEmail(""); setPassword(""); setConfirmPassword("");
  };

  const modeLabel = { login: "Sign In", register: "Create Account", reset: "Reset Password" }[mode];
  const modeSubtitle = { login: "Root cause learning diagnosis", register: "Start your learning journey", reset: "Reset your password" }[mode];

  /* ── LOGGED IN ── */
  if (user) {
    return (
      <div className="lp-root">
        <div className="lp-bg" /><div className="lp-noise" />
        <div className="lp-orb lp-orb-1" /><div className="lp-orb lp-orb-2" />
        <div className="lp-blob lp-blob-1" /><div className="lp-blob lp-blob-2" />
        <div className="lp-window" style={{ maxWidth: 440, width: "100%", padding: "0 24px", zIndex: 1 }}>
          <div className="lp-card dashboard-card" style={{ textAlign: "center" }}>
            <div className="lp-titlebar">
              <div className="lp-traffic-light lp-tl-red" />
              <div className="lp-traffic-light lp-tl-yellow" />
              <div className="lp-traffic-light lp-tl-green" />
              <span className="lp-titlebar-label">Profile</span>
            </div>
            <div className="lp-card-body">
              <div className="dashboard-avatar">
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" className="avatar-img" />
                  : <div className="avatar-placeholder">{(user.displayName || user.email || "U")[0].toUpperCase()}</div>}
              </div>
              <div className="dashboard-badge">✓ Authenticated</div>
              <h1 className="dashboard-title">Welcome{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!</h1>
              <p className="dashboard-email">{user.email}</p>
              <div className="dashboard-info">
                <div className="info-item">
                  <span className="info-label">Provider</span>
                  <span className="info-value">{user.providerData[0]?.providerId === "google.com" ? "🔵 Google" : "📧 Email"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">UID</span>
                  <span className="info-value uid">{user.uid.slice(0, 16)}…</span>
                </div>
              </div>
              <button className="btn btn-signout" onClick={signOut} id="signout-btn">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── AUTH ── */
  return (
    <div className="lp-root">
      <div className="lp-bg" />
      <div className="lp-noise" />
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      <div className="lp-layout">
        {/* ── LEFT HERO ── */}
        <motion.div className="lp-hero"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>

          <div className="lp-eyebrow">
            <div className="lp-eyebrow-pulse" />
            AI-Powered Learning Diagnosis
          </div>

          <h1 className="lp-hero-title">
            Understand<br />
            <span className="lp-title-why">WHY</span> You Fail<br />
            — Not Just What
          </h1>

          <p className="lp-hero-sub">
            LearnLens AI pinpoints the root cause of your knowledge gaps using concept dependency analysis and multi-signal behavioral patterns.
          </p>

          <div className="lp-features">
            {features.map((f, i) => (
              <motion.div key={i} className="lp-feature"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <div className="lp-feature-icon">{f.icon}</div>
                <span className="lp-feature-text">{f.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="lp-stats">
            {[
              { num: "∞", label: "Subjects supported" },
              { num: "AI", label: "Question generation" },
              { num: "100%", label: "Root cause accuracy" },
            ].map((s, i) => (
              <motion.div key={i} className="lp-stat"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT — macOS WINDOW CARD ── */}
        <motion.div className="lp-window"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>

          <div className="lp-card" id="auth-card">
            {/* macOS Title Bar */}
            <div className="lp-titlebar">
              <div className="lp-traffic-light lp-tl-red" />
              <div className="lp-traffic-light lp-tl-yellow" />
              <div className="lp-traffic-light lp-tl-green" />
              <span className="lp-titlebar-label">LearnLens AI</span>
            </div>

            {/* Body */}
            <div className="lp-card-body">
              {/* Brand */}
              <div className="lp-brand">
                <div className="lp-brand-icon">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M9 11h14M9 16h10M9 21h7" stroke="#0A84FF" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="22" cy="21" r="4" fill="rgba(191,90,242,0.3)" stroke="#BF5AF2" strokeWidth="1.5"/>
                    <path d="M20.5 21l1.2 1.2L23.5 19.5" stroke="#BF5AF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="lp-brand-name">LearnLens <span className="brand-ai">AI</span></span>
              </div>
              <p className="lp-card-subtitle">{modeSubtitle}</p>

              <AnimatePresence mode="wait">
                <motion.div key={mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}>

                  <h2 className="lp-mode-title">{modeLabel}</h2>

                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <form className="lp-form" onSubmit={handleEmailAuth} noValidate>
                    <div className="form-group">
                      <label htmlFor="email-input" className="form-label">Email address</label>
                      <input id="email-input" type="email" className="form-input"
                        placeholder="you@example.com" value={email}
                        onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                    </div>

                    {mode !== "reset" && (
                      <div className="form-group">
                        <label htmlFor="password-input" className="form-label">Password</label>
                        <div className="input-wrapper">
                          <input id="password-input" type={showPassword ? "text" : "password"} className="form-input"
                            placeholder="Your password" value={password}
                            onChange={e => setPassword(e.target.value)} required
                            autoComplete={mode === "login" ? "current-password" : "new-password"} />
                          <button type="button" className="eye-btn"
                            onClick={() => setShowPassword(!showPassword)} id="toggle-password">
                            <EyeIcon show={showPassword} />
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === "register" && (
                      <div className="form-group">
                        <label htmlFor="confirm-password-input" className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                          <input id="confirm-password-input" type={showPassword ? "text" : "password"} className="form-input"
                            placeholder="Re-enter your password" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                      </div>
                    )}

                    {mode === "login" && (
                      <div className="forgot-link-wrapper">
                        <button type="button" className="forgot-link"
                          onClick={() => switchMode("reset")} id="forgot-password-link">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary"
                      disabled={loading || googleLoading} id="submit-auth-btn">
                      {loading ? <><SpinnerIcon /> Processing…</> : modeLabel}
                    </button>
                  </form>

                  {mode !== "reset" && (
                    <>
                      <div className="divider"><span>or continue with</span></div>
                      <button className="btn btn-google" onClick={handleGoogleLogin}
                        disabled={loading || googleLoading} id="google-signin-btn">
                        {googleLoading ? <SpinnerIcon /> : <GoogleIcon />}
                        <span>Continue with Google</span>
                      </button>
                    </>
                  )}

                  {mode === "reset" && (
                    <button type="button" className="back-link"
                      onClick={() => switchMode("login")} id="back-to-login">
                      ← Back to Sign In
                    </button>
                  )}

                  {mode !== "reset" && (
                    <p className="lp-footer">
                      {mode === "login" ? (
                        <>No account?{" "}<button className="switch-link" onClick={() => switchMode("register")} id="switch-to-register">Sign Up free</button></>
                      ) : (
                        <>Already have an account?{" "}<button className="switch-link" onClick={() => switchMode("login")} id="switch-to-login">Sign In</button></>
                      )}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
