"use client";

import { useState, useEffect } from "react";
import Feed from "./components/Feed";

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🧠 LOAD SAVED FEED ON PAGE LOAD
  useEffect(() => {
    const saved = localStorage.getItem("upgrade_feed");
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  // 🧠 SAVE FEED EVERY TIME IT CHANGES
  useEffect(() => {
    localStorage.setItem("upgrade_feed", JSON.stringify(results));
  }, [results]);

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

      // ADD NEW RESULT TO TOP
      setResults((prev) => [data, ...prev]);

      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // 🧠 CLEAR FEED FUNCTION
  function clearFeed() {
    setResults([]);
    localStorage.removeItem("upgrade_feed");
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

        {/* BUTTONS */}
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