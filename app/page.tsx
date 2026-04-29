"use client";

import { useState, useEffect } from "react";
import Feed from "./components/Feed";
import { createClient } from "@supabase/supabase-js";

// 🔧 Initialize Supabase
const supabase = createClient(
  "https://wqzcqnhtiujalriciydy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemNxbmh0aXVqYWxyaWNpeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDUyMzcsImV4cCI6MjA5Mjk4MTIzN30.w0pSXvGxdDKBD_2-zsxJzcujv8rJD0IgGRufhbgd3Y8"
);

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 📥 LOAD DATA FROM SUPABASE ON PAGE LOAD
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("upgrades")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setResults(data);
      } else {
        console.error("Supabase fetch error:", error);
      }
    }

    loadData();
  }, []);

  // 🤖 ANALYZE FUNCTION
  async function analyze() {
    if (!text.trim()) return;

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

      // ❌ Handle AI errors
      if (data.error) {
        console.error("AI Error:", data);
        return;
      }

      // 💾 SAVE TO SUPABASE
      const { error } = await supabase.from("upgrades").insert([
        {
          title: data.title,
          summary: data.summary,
          what_changed: data.what_changed,
          why_it_changed: data.why_it_changed,
          user_impact: data.user_impact,
          developer_impact: data.developer_impact,
          impact_level: data.impact_level
        }
      ]);

      if (error) {
        console.error("Supabase Insert Error:", error);
      }

      // 🧠 UPDATE UI
      setResults((prev) => [data, ...prev]);

      // ✨ CLEAR INPUT
      setText("");
    } catch (err) {
      console.error("Analyze failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function clearFeed() {
    setResults([]);
  }

  return (
    <main style={{ background: "#F6F3EE", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", padding: 32 }}>
        <h1>Base Interpretation Feed</h1>
        <p style={{ color: "#5B6472" }}>
          Track and understand Base upgrades in real time
        </p>

        {/* INPUT */}
        <textarea
          placeholder="Paste Base upgrade announcement or description..."
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

        {/* BUTTON */}
        <br />

        <button
          onClick={analyze}
          disabled={!text.trim() || loading}
          style={{
            marginTop: 12,
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

        {/* CLEAR BUTTON */}
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
      </div>

      {/* FEED */}
      <Feed results={results} />
    </main>
  );
}