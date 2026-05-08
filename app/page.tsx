"use client";

import { useState, useEffect } from "react";
import Feed from "./components/Feed";
import { createClient } from "../lib/lsupabase";

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

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<UpgradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔐 Check auth
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

  // 📥 Load from DB
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

  const linkStyle: React.CSSProperties = {
    color: "#2563EB",
    fontWeight: 600,
    textDecoration: "none"
  };

  const githubLinkStyle: React.CSSProperties = {
    color: "#6B7280",
    textDecoration: "none",
    fontWeight: 500
  };

  if (authLoading) {
    return (
      <main style={{ background: "#EDEAE4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ background: "#EDEAE4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{
        borderBottom: "1px solid #D8D4CC",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#EDEAE4"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#2563EB",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>BaseLens</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #D8D4CC",
              background: "transparent",
              fontSize: 13,
              color: "#6B7280",
              cursor: "pointer"
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
          background: "#E8F0FE",
          color: "#2563EB",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "4px 12px",
          borderRadius: 20,
          marginBottom: 20
        }}>
          AI-Powered. Real-Time. Structured
        </div>

        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.15,
          color: "#0F1117",
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
              border: "1.5px solid #D8D4CC",
              background: "#FAFAF8",
              color: "#0F1117",
              fontSize: 14,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "inherit"
            }}
          />

          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8, textAlign: "left" }}>
            This tool analyzes structured upgrade information, not general questions.
          </p>

          {/* EXAMPLES */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#6B7280", paddingTop: 6 }}>Try:</span>
            <button onClick={() => handleExample("Base Azul upgrade introduces improved transaction sequencing and reduced latency across the network.")} style={exampleBtn}>
              Base Azul
            </button>
            <button onClick={() => handleExample("Base update improves gas efficiency and lowers transaction fees through batching optimizations.")} style={exampleBtn}>
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
              background: !text.trim() || loading ? "#9CA3AF" : "#2563EB",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: !text.trim() || loading ? "not-allowed" : "pointer",
              letterSpacing: "-0.2px"
            }}
          >
            {loading ? "Analyzing..." : "Analyze Upgrade"}
          </button>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontSize: 12,
            color: "#6B7280",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 16
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
                  background: "#2563EB",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
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
            fontSize: 12
          }}>
            Clear feed
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {results.length === 0 && (
        <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginBottom: 40 }}>
          No analyses yet. Use an example above to get started.
        </p>
      )}

      {/* FEED */}
      <Feed results={results} />

      {/* FOOTER */}
      <footer style={{
        marginTop: "auto",
        borderTop: "1px solid #D8D4CC",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 13,
        color: "#6B7280"
      }}>
        <span>Built by</span>
        <a href="https://x.com/olumi441" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Abu Olumi
        </a>
        <span>·</span>
        <a href="https://github.com/2TheMoom/baselens" target="_blank" rel="noopener noreferrer" style={githubLinkStyle}>
          GitHub
        </a>
      </footer>

    </main>
  );
}

const exampleBtn: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 20,
  border: "1px solid #D8D4CC",
  background: "#FAFAF8",
  cursor: "pointer",
  fontSize: 12,
  color: "#0F1117"
};