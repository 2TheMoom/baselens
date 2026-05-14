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

  async function handleTwitter() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
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
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#1F3A8F",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", color: "#161719" }}>BaseLens</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px", color: "#161719" }}>
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
          {isSignUp ? "Sign up to start analyzing Base upgrades" : "Sign in to your BaseLens account"}
        </p>

        {/* SOCIAL BUTTONS */}
        <button onClick={handleGoogle} style={socialBtn}>
          <span style={{ fontSize: 16 }}>G</span>
          Continue with Google
        </button>

        <button onClick={handleTwitter} style={socialBtn}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>X</span>
          Continue with X (Twitter)
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