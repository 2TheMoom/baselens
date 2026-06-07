"use client";

import { useState } from "react";
import { createClient } from "../../lib/lsupabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleEmailAuth() {
    if (!email || !password) return;
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) setMessage(error.message);
      else setMessage("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setMessage(error.message);
  }

  return (
    <main style={{
      background: "#E9E6DF",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "var(--font-heading)"
    }}>
      <div style={{
        background: "#F0EDE7",
        border: "1px solid #D4D0C8",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="14" cy="14" r="11" stroke="#1F3A8F" strokeWidth="2.5"/>
            <circle cx="14" cy="14" r="7" stroke="#1F3A8F" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="3" fill="#1F3A8F"/>
            <line x1="3" y1="14" x2="25" y2="14" stroke="#1A6B3C" strokeWidth="1.2" strokeDasharray="3 2"/>
            <line x1="22" y1="22" x2="29" y2="29" stroke="#1F3A8F" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="29" cy="29" r="2" fill="#1A6B3C"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px", color: "#161719" }}>
            Base<span style={{ color: "#1F3A8F" }}>Lens</span>
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px", color: "#161719" }}>
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
          {isSignUp ? "Sign up to start analyzing Base upgrades" : "Sign in to your BaseLens account"}
        </p>

        {/* GOOGLE BUTTON */}
        <button onClick={handleGoogle} style={socialBtn}>
          <span style={{ fontSize: 16 }}>G</span>
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#D4D0C8" }} />
          <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "var(--font-mono)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#D4D0C8" }} />
        </div>

        {/* EMAIL INPUT */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, marginTop: 10 }}
        />

        {/* MESSAGE */}
        {message && (
          <p style={{
            fontSize: 13,
            color: message.includes("Check") ? "#1A6B3C" : "#B01C2E",
            marginTop: 10,
            fontFamily: "var(--font-mono)"
          }}>
            {message}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleEmailAuth}
          disabled={loading || !email || !password}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "13px 20px",
            borderRadius: 12,
            border: "none",
            background: !email || !password || loading ? "#9CA3AF" : "#1F3A8F",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: !email || !password || loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.02em"
          }}
        >
          {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        </button>

        {/* TOGGLE */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginTop: 20 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          {" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
            style={{ background: "none", border: "none", color: "#1F3A8F", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}

const socialBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1.5px solid #D4D0C8",
  background: "#E9E6DF",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  color: "#161719",
  fontFamily: "var(--font-heading)"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #D4D0C8",
  background: "#E9E6DF",
  fontSize: 14,
  color: "#161719",
  outline: "none",
  fontFamily: "var(--font-heading)"
};