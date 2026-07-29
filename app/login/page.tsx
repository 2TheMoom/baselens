"use client";

import { useState } from "react";
import { createClient } from "../../lib/lsupabase";
import Logo from "../components/Logo";

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
      background: "var(--background)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "var(--font-body)"
    }}>
      <div style={{
        background: "var(--card-elevated)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-lg)",
        padding: "40px 36px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "var(--shadow-lg)"
      }}>

        {/* LOGO */}
        <div style={{ marginBottom: 28 }}>
          <Logo size={32} />
        </div>

        <h1 style={{ fontSize: 27, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
          {isSignUp ? "Sign up to start analyzing Base upgrades" : "Sign in to your BaseLens account"}
        </p>

        {/* GOOGLE BUTTON */}
        <button onClick={handleGoogle} style={socialBtn}>
          <span style={{ fontSize: 16 }}>G</span>
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
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
            color: message.includes("Check") ? "var(--green)" : "var(--crimson)",
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
            borderRadius: "var(--radius-md)",
            border: "none",
            background: !email || !password || loading ? "#9CA3AF" : "var(--accent)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: !email || !password || loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.02em"
          }}
        >
          {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        </button>

        {/* TOGGLE */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 20 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          {" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
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
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  background: "var(--background)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  color: "var(--foreground)",
  fontFamily: "var(--font-body)"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  background: "var(--background)",
  fontSize: 14,
  color: "var(--foreground)",
  outline: "none",
  fontFamily: "var(--font-body)"
};