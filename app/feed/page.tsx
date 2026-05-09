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
    <main style={{ background: "#EDEAE4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

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
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>BaseLens</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
            My Dashboard
          </Link>
          <button
            onClick={triggerFetch}
            disabled={refreshing}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: refreshing ? "#9CA3AF" : "#2563EB",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: refreshing ? "not-allowed" : "pointer"
            }}
          >
            {refreshing ? "Fetching..." : "Fetch Latest"}
          </button>
        </div>
      </header>

      <section style={{ textAlign: "center", padding: "40px 32px 24px" }}>
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
          marginBottom: 16
        }}>
          Auto-Updated. AI-Analyzed. Public
        </div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.8px",
          lineHeight: 1.2,
          color: "#0F1117",
          maxWidth: 500,
          margin: "0 auto 12px"
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
            color: message.includes("error") || message.includes("Failed") ? "#D64545" : "#16A34A",
            fontWeight: 500
          }}>
            {message}
          </p>
        )}
      </section>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 40px", width: "100%" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginTop: 40 }}>
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
                background: "#2563EB",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
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
                    style={{ fontSize: 12, color: "#2563EB", textDecoration: "none" }}
                  >
                    View original release
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
        <a
          href="https://x.com/olumi441"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}
        >
          Abu Olumi
        </a>
        <span>·</span>
        <a
          href="https://github.com/2TheMoom/baselens"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6B7280", textDecoration: "none", fontWeight: 500 }}
        >
          GitHub
        </a>
      </footer>

    </main>
  );
}
