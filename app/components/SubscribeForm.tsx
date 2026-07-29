"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      setIsError(!!data.error);
      setMessage(data.message || data.error || "Something went wrong.");
      if (!data.error) setEmail("");
    } catch {
      setIsError(true);
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "var(--card-elevated)",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      maxWidth: 460,
      margin: "0 auto",
      boxShadow: "var(--shadow-sm)"
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 10, fontFamily: "var(--font-display)" }}>
        Get notified of new upgrades
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--border)",
            background: "var(--background)",
            fontSize: 13,
            color: "var(--foreground)",
            outline: "none",
            fontFamily: "var(--font-body)"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "9px 16px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: loading ? "#9CA3AF" : "var(--accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            whiteSpace: "nowrap"
          }}
        >
          {loading ? "Sending..." : "Subscribe"}
        </button>
      </form>
      {message && (
        <p style={{
          marginTop: 8,
          fontSize: 12,
          color: isError ? "var(--crimson)" : "var(--green)",
          fontFamily: "var(--font-mono)"
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
