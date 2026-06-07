"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/lsupabase";
import UpgradeCard from "../components/UpgradeCard";

const supabase = createClient();

type PublicUpgrade = {
  id: string;
  title: string;
  summary: string;
  category: string;
  what_changed: string;
  why_it_changed: string;
  user_impact: string;
  developer_impact: string;
  significance_reason: string;
  impact_level: string;
  source_url: string;
  created_at: string;
  _key?: number;
};

export default function FeedPage() {
  const [upgrades, setUpgrades] = useState<PublicUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  async function loadUpgrades() {
    const { data, error } = await supabase
      .from("public_upgrades")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setUpgrades(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await loadUpgrades();
    }
    init();
  }, []);

  async function triggerFetch() {
    setRefreshing(true);
    setMessage("");
    try {
      const res = await fetch("/api/auto-fetch");
      const data = await res.json();
      setMessage(data.message || data.error || "Done");
      await loadUpgrades();
    } catch {
      setMessage("Fetch failed");
    } finally {
      setRefreshing(false);
    }
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

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
            My Dashboard
          </Link>
          <button
            onClick={triggerFetch}
            disabled={refreshing}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: refreshing ? "#9CA3AF" : "#1F3A8F",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: refreshing ? "not-allowed" : "pointer",
              fontFamily: "var(--font-heading)"
            }}
          >
            {refreshing ? "Fetching..." : "Fetch Latest"}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "40px 32px 24px" }}>
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
          marginBottom: 16,
          fontFamily: "var(--font-mono)"
        }}>
          Auto-Updated. AI-Analyzed. Public
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
          color: "#161719",
          maxWidth: 500,
          margin: "0 auto 12px",
          fontFamily: "var(--font-heading)"
        }}>
          Base Upgrade Feed
        </h1>

        <p style={{
          color: "#6B7280",
          maxWidth: 420,
          margin: "0 auto",
          fontSize: 14,
          lineHeight: 1.6
        }}>
          Automatically fetched and analyzed Base upgrades.
          Updated every 6 hours. No login required.
        </p>

        {message && (
          <p style={{
            marginTop: 16,
            fontSize: 13,
            color: message.includes("error") || message.includes("Failed") ? "#B01C2E" : "#1A6B3C",
            fontWeight: 600,
            fontFamily: "var(--font-mono)"
          }}>
            {message}
          </p>
        )}
      </section>

      {/* FEED */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 40px", width: "100%" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginTop: 40, fontFamily: "var(--font-mono)" }}>
            Loading upgrades...
          </p>
        ) : upgrades.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
              No upgrades yet. Click Fetch Latest to pull from Base GitHub.
            </p>
            <button
              onClick={triggerFetch}
              disabled={refreshing}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: "#1F3A8F",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-heading)"
              }}
            >
              {refreshing ? "Fetching..." : "Fetch Now"}
            </button>
          </div>
        ) : (
          upgrades.map((upgrade) => (
            <div key={upgrade.id}>
              <UpgradeCard data={upgrade} isNew={false} />
              {upgrade.source_url && (
                <div style={{ marginTop: -12, marginBottom: 20, paddingLeft: 4 }}>
                  <a
                    href={upgrade.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#1F3A8F", textDecoration: "none", fontFamily: "var(--font-mono)" }}
                  >
                    View original release
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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