"use client";

import { useState } from "react";
import Feed from "./components/Feed";

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

      // 🧠 ADD NEW RESULT TO TOP OF FEED
      setResults((prev) => [data, ...prev]);

      // clear input after submit
      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      </div>

      {/* FEED */}
      <Feed results={results} />
    </main>
  );
}