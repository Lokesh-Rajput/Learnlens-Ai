import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import SubjectSelection from "./components/SubjectSelection";
import QuizPage from "./components/QuizPage";
import ResultDashboard from "./components/ResultDashboard";

const LoadingScreen = () => (
  <div style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#0a0a0a", gap: "20px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: "50%",
      border: "2.5px solid rgba(255,106,0,0.12)",
      borderTopColor: "#ff6a00",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: 14, color: "#636366", fontWeight: 500, letterSpacing: "0.02em" }}>
      LearnLens AI
    </span>
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={
          <AuthRoute><LoginPage /></AuthRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute><SubjectSelection /></ProtectedRoute>
        } />
        <Route path="/quiz/:subject" element={
          <ProtectedRoute><QuizPage /></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><ResultDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
