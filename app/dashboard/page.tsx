"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Feed from "../components/Feed";
import { createClient } from "../../lib/lsupabase";

const supabase = createClient();

type UpgradeResult = {
  title: string;
  summary: string;
  category: string;
  what_changed: string;
  why_it_changed: string;
  user_impact: string;
  developer_impact: string;
  significance_reason: string;
  impact_level: string;
  _key?: number;
};

type User = {
  id: string;
  email?: string;
};

export default function Dashboard() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<UpgradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    }
    checkUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const { data, error } = await supabase
        .from("upgrades")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (!error && data) setResults(data);
      else console.error("Fetch error:", error);
    }
    loadData();
  }, [user]);

  async function analyze() {
    if (!text.trim() || !user) return;

    const normalizedInput = text.trim().toLowerCase();
    if (recentInputs.includes(normalizedInput)) {
      alert("You have already analyzed this text. Try a different announcement.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (data.error) {
        console.error("AI error:", data.error);
        alert("Error: " + data.error);
        return;
      }

      const { data: existing } = await supabase
        .from("upgrades")
        .select("id")
        .eq("user_id", user.id)
        .ilike("title", data.title.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        alert("This upgrade has already been analyzed. Check the feed below.");
        setText("");
        return;
      }

      const { error } = await supabase.from("upgrades").insert([{
        title: data.title,
        summary: data.summary,
        category: data.category,
        what_changed: data.what_changed,
        why_it_changed: data.why_it_changed,
        user_impact: data.user_impact,
        developer_impact: data.developer_impact,
        significance_reason: data.significance_reason,
        impact_level: data.impact_level,
        user_id: user.id
      }]);

      if (error) console.error("Insert error:", error);

      setRecentInputs((prev) => [...prev, normalizedInput]);
      const newResult = { ...data, _key: Date.now() };
      setResults((prev) => [newResult, ...prev]);
      setText("");
    } catch (err) {
      console.error("Analyze failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function clearFeed() {
    setResults([]);
    setRecentInputs([]);
  }

  function handleExample(example: string) {
    setText(example);
  }

  if (authLoading) {
    return (
      <main style={{ background: "#E9E6DF", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6B7280", fontSize: 14, fontFamily: "var(--font-mono)" }}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ background: "#E9E6DF", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-heading)" }}>

      {/* HEADER */}
      <header style={{
        borderBottom: "1px solid #D4D0C8",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#E9E6DF"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="14" cy="14" r="11" stroke="#1F3A8F" strokeWidth="2.5"/>
            <circle cx="14" cy="14" r="7" stroke="#1F3A8F" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="3" fill="#1F3A8F"/>
            <line x1="3" y1="14" x2="25" y2="14" stroke="#1A6B3C" strokeWidth="1.2" strokeDasharray="3 2"/>
            <line x1="22" y1="22" x2="29" y2="29" stroke="#1F3A8F" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="29" cy="29" r="2" fill="#1A6B3C"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px", color: "#161719" }}>
            Base<span style={{ color: "#1F3A8F" }}>Lens</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/feed" style={{ fontSize: 13, color: "#1F3A8F", textDecoration: "none", fontWeight: 600 }}>
            Public Feed
          </Link>
          <span style={{ fontSize: 13, color: "#6B7280", fontFamily: "var(--font-mono)" }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #D4D0C8",
              background: "transparent",
              fontSize: 13,
              color: "#6B7280",
              cursor: "pointer",
              fontFamily: "var(--font-heading)"
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "56px 32px 40px" }}>
        <div style={{
          display: "inline-block",
          background: "#1F3A8F18",
          color: "#1F3A8F",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "4px 12px",
          borderRadius: 20,
          marginBottom: 20,
          fontFamily: "var(--font-mono)"
        }}>
          AI-Powered. Real-Time. Structured
        </div>

        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.15,
          color: "#161719",
          maxWidth: 560,
          margin: "0 auto 16px"
        }}>
          Understand Every Base Upgrade Clearly
        </h1>

        <p style={{
          color: "#6B7280",
          maxWidth: 460,
          margin: "0 auto 32px",
          fontSize: 15,
          lineHeight: 1.6
        }}>
          Paste an official announcement, changelog, or release note.
          Get structured insights instantly.
        </p>

        {/* TEXTAREA */}
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <textarea
            placeholder="Paste a Base upgrade announcement, changelog, or release note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 120,
              padding: "14px 16px",
              borderRadius: 12,
              border: "1.5px solid #D4D0C8",
              background: "#F0EDE7",
              color: "#161719",
              fontSize: 14,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-heading)"
            }}
          />

          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8, textAlign: "left", fontFamily: "var(--font-mono)" }}>
            This tool analyzes structured upgrade information, not general questions.
          </p>

          {/* EXAMPLES */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#6B7280", paddingTop: 6 }}>Try:</span>
            <button
              onClick={() => handleExample("Base Azul upgrade introduces improved transaction sequencing and reduced latency across the network.")}
              style={exampleBtn}
            >
              Base Azul
            </button>
            <button
              onClick={() => handleExample("Base update improves gas efficiency and lowers transaction fees through batching optimizations.")}
              style={exampleBtn}
            >
              Gas Optimization
            </button>
          </div>

          {/* ANALYZE BUTTON */}
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: "none",
              background: !text.trim() || loading ? "#9CA3AF" : "#1F3A8F",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: !text.trim() || loading ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              fontFamily: "var(--font-heading)"
            }}
          >
            {loading ? "Analyzing..." : "Analyze Upgrade"}
          </button>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontSize: 11,
            color: "#6B7280",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 16,
            fontFamily: "var(--font-mono)"
          }}>
            How it works
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            fontSize: 13,
            color: "#6B7280",
            flexWrap: "wrap"
          }}>
            {["Paste an upgrade or changelog", "AI analyzes the changes", "Get a structured breakdown"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#1F3A8F",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: "var(--font-mono)"
                }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLEAR FEED */}
      {results.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <button onClick={clearFeed} style={{
            background: "transparent",
            border: "none",
            color: "#6B7280",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "var(--font-mono)"
          }}>
            Clear feed
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {results.length === 0 && (
        <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 40, fontFamily: "var(--font-mono)" }}>
          No analyses yet. Use an example above to get started.
        </p>
      )}

      {/* FEED */}
      <Feed results={results} />

      {/* FOOTER */}
      <footer style={{
        marginTop: "auto",
        borderTop: "1px solid #D4D0C8",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 13,
        color: "#6B7280"
      }}>
        <span>Built by</span>
        <a href="https://x.com/olumi441" target="_blank" rel="noopener noreferrer"
          style={{ color: "#1F3A8F", fontWeight: 700, textDecoration: "none" }}>
          Abu Olumi
        </a>
        <span>·</span>
        <a href="https://github.com/2TheMoom/baselens" target="_blank" rel="noopener noreferrer"
          style={{ color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
          GitHub
        </a>
      </footer>

    </main>
  );
}

const exampleBtn: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 20,
  border: "1px solid #D4D0C8",
  background: "#F0EDE7",
  cursor: "pointer",
  fontSize: 12,
  color: "#161719",
  fontFamily: "var(--font-heading)"
};