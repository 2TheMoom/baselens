"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Feed from "../components/Feed";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
  const [page, setPage] = useState(1);
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
      setPage(1);
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
    setPage(1);
  }

  function handleExample(example: string) {
    setText(example);
  }

  if (authLoading) {
    return (
      <main style={{ background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--font-mono)" }}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <Header
        right={
          <>
            <Link href="/feed" style={{ fontSize: 13.5, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Public Feed
            </Link>
            <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "transparent",
                fontSize: 13,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "var(--font-display)"
              }}
            >
              Sign out
            </button>
          </>
        }
      />

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "60px 32px 44px" }}>
        <div style={{
          display: "inline-block",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "5px 14px",
          borderRadius: "var(--radius-full)",
          marginBottom: 22,
          fontFamily: "var(--font-mono)"
        }}>
          AI-Powered · Real-Time · Structured
        </div>

        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.15,
          color: "var(--foreground)",
          maxWidth: 560,
          margin: "0 auto 16px",
          fontFamily: "var(--font-display)"
        }}>
          Understand Every Base Upgrade Clearly
        </h1>

        <p style={{
          color: "var(--muted)",
          maxWidth: 460,
          margin: "0 auto 36px",
          fontSize: 15,
          lineHeight: 1.65,
          fontFamily: "var(--font-body)"
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
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border)",
              background: "var(--card-elevated)",
              color: "var(--foreground)",
              fontSize: 14,
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-body)"
            }}
          />

          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, textAlign: "left", fontFamily: "var(--font-mono)" }}>
            This tool analyzes structured upgrade information, not general questions.
          </p>

          {/* EXAMPLES */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-body)" }}>Try:</span>
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
              borderRadius: "var(--radius-md)",
              border: "none",
              background: !text.trim() || loading ? "#9CA3AF" : "var(--accent)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: !text.trim() || loading ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              fontFamily: "var(--font-display)",
              boxShadow: !text.trim() || loading ? "none" : "var(--shadow-sm)"
            }}
          >
            {loading ? "Analyzing..." : "Analyze Upgrade"}
          </button>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginTop: 36 }}>
          <p style={{
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.12em",
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
            color: "var(--muted)",
            flexWrap: "wrap",
            fontFamily: "var(--font-body)"
          }}>
            {["Paste an upgrade or changelog", "AI analyzes the changes", "Get a structured breakdown"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--accent)",
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
            color: "var(--muted)",
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
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginBottom: 40, fontFamily: "var(--font-mono)" }}>
          No analyses yet. Use an example above to get started.
        </p>
      )}

      {/* FEED */}
      <Feed results={results} page={page} onPageChange={setPage} />

      <Footer />

    </main>
  );
}

const exampleBtn: React.CSSProperties = {
  padding: "5px 14px",
  borderRadius: "var(--radius-full)",
  border: "1px solid var(--border)",
  background: "var(--card-elevated)",
  cursor: "pointer",
  fontSize: 12,
  color: "var(--foreground)",
  fontFamily: "var(--font-body)"
};
