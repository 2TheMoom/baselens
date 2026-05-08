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
      else window.location.href = "/";
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
      background: "#EDEAE4",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div style={{
        background: "#F5F2EC",
        border: "1px solid #D8D4CC",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
      }}>
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#2563EB",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>BaseLens</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>
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
          <div style={{ flex: 1, height: 1, background: "#D8D4CC" }} />
          <span style={{ fontSize: 12, color: "#6B7280" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#D8D4CC" }} />
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
            color: message.includes("Check") ? "#16A34A" : "#D64545",
            marginTop: 10
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
            background: !email || !password || loading ? "#9CA3AF" : "#2563EB",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: !email || !password || loading ? "not-allowed" : "pointer"
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
            style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
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
  border: "1.5px solid #D8D4CC",
  background: "#FAFAF8",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  color: "#0F1117"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #D8D4CC",
  background: "#FAFAF8",
  fontSize: 14,
  color: "#0F1117",
  outline: "none",
  fontFamily: "inherit"
};