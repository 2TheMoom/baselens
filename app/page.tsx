"use client";

import { useState, useEffect } from "react";
import Feed from "./components/Feed";
import { createClient } from "@supabase/supabase-js";

// 🔧 Supabase init
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<UpgradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentInputs, setRecentInputs] = useState<string[]>([]);

  // 📥 Load from DB
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("upgrades")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setResults(data);
      } else {
        console.error("Fetch error:", error);
      }
    }

    loadData();
  }, []);

  // 🤖 Analyze
  async function analyze() {
    if (!text.trim()) return;

    // 🛡️ CHECK 1 — Same input text already analyzed this session
    const normalizedInput = text.trim().toLowerCase();
    if (recentInputs.includes(normalizedInput)) {
      alert("You've already analyzed this text. Try a different announcement.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (data.error) {
        console.error("AI error:", data.error);
        alert("Error: " + data.error);
        return;
      }

      // 🛡️ CHECK 2 — Same title already exists in Supabase
      const { data: existing } = await supabase
        .from("upgrades")
        .select("id")
        .ilike("title", data.title.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        alert("This upgrade has already been analyzed. Check the feed below.");
        setText("");
        return;
      }

      // 💾 Save to Supabase
      const { error } = await supabase.from("upgrades").insert([
        {
          title: data.title,
          summary: data.summary,
          category: data.category,
          what_changed: data.what_changed,
          why_it_changed: data.why_it_changed,
          user_impact: data.user_impact,
          developer_impact: data.developer_impact,
          significance_reason: data.significance_reason,
          impact_level: data.impact_level
        }
      ]);

      if (error) {
        console.error("Insert error:", error);
      }

      // ✅ Track this input to prevent re-analysis this session
      setRecentInputs((prev) => [...prev, normalizedInput]);

      // 🧠 Update UI instantly with unique key for animation
      const newResult = { ...data, _key: Date.now() };
      setResults((prev) => [newResult, ...prev]);

      setText("");
    } catch (err) {
      console.error("Analyze failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🧹 Clear feed (UI only)
  function clearFeed() {
    setResults([]);
    setRecentInputs([]);
  }

  // 🧪 Example handler
  function handleExample(example: string) {
    setText(example);
  }

  return (
    <main style={{ background: "#F6F3EE", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <h1>Base Upgrade Intelligence</h1>

        <p style={{ color: "#5B6472", maxWidth: 520, margin: "0 auto" }}>
          Understand Base upgrades clearly. Paste an official announcement,
          changelog, or release note to get structured insights.
        </p>

        {/* INPUT */}
        <textarea
          placeholder="Paste a Base upgrade announcement, changelog, or release note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 600,
            height: 120,
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd"
          }}
        />

        {/* HELPER TEXT */}
        <p style={{ fontSize: 12, color: "#8A94A6", marginTop: 8 }}>
          This tool analyzes structured upgrade information — not general
          questions.
        </p>

        {/* EXAMPLES */}
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() =>
              handleExample(
                "Base Azul upgrade introduces improved transaction sequencing and reduced latency across the network."
              )
            }
            style={exampleBtn}
          >
            Example: Base Azul
          </button>

          <button
            onClick={() =>
              handleExample(
                "Base update improves gas efficiency and lowers transaction fees through batching optimizations."
              )
            }
            style={exampleBtn}
          >
            Example: Gas Optimization
          </button>
        </div>

        {/* ANALYZE BUTTON */}
        <br />

        <button
          onClick={analyze}
          disabled={!text.trim() || loading}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: !text.trim() || loading ? "not-allowed" : "pointer",
            opacity: !text.trim() || loading ? 0.5 : 1
          }}
        >
          {loading ? "Analyzing..." : "Analyze Upgrade"}
        </button>

        {/* CLEAR FEED */}
        {results.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={clearFeed}
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                cursor: "pointer",
                fontSize: 12
              }}
            >
              Clear feed
            </button>
          </div>
        )}

        {/* HOW IT WORKS */}
        <div style={{ marginTop: 20, fontSize: 13, color: "#6B7280" }}>
          <p>How it works:</p>
          <p>1. Paste an upgrade or changelog</p>
          <p>2. AI analyzes the changes</p>
          <p>3. Get a structured breakdown of impact</p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {results.length === 0 && (
        <p style={{ textAlign: "center", color: "#8A94A6" }}>
          No analyses yet. Use an example above to get started.
        </p>
      )}

      {/* FEED */}
      <Feed results={results} />
    </main>
  );
}

// 🎨 Example button style
const exampleBtn = {
  margin: "4px",
  padding: "6px 12px",
  borderRadius: 20,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 12
};