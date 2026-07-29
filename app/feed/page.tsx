"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "../../lib/lsupabase";
import UpgradeCard from "../components/UpgradeCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";

const supabase = createClient();

const PAGE_SIZE = 6;

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

type FilterLevel = "All" | "High" | "Medium" | "Low";

export default function FeedPage() {
  const [upgrades, setUpgrades] = useState<PublicUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterLevel>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  function updateFilter(level: FilterLevel) {
    setFilter(level);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

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

  const filteredUpgrades = useMemo(() => {
    return upgrades
      .filter((u) => filter === "All" || u.impact_level === filter)
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          u.title?.toLowerCase().includes(q) ||
          u.summary?.toLowerCase().includes(q) ||
          u.category?.toLowerCase().includes(q) ||
          u.what_changed?.toLowerCase().includes(q) ||
          u.why_it_changed?.toLowerCase().includes(q)
        );
      });
  }, [upgrades, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUpgrades.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUpgrades = filteredUpgrades.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const highCount = upgrades.filter((u) => u.impact_level === "High").length;
  const mediumCount = upgrades.filter((u) => u.impact_level === "Medium").length;
  const lowCount = upgrades.filter((u) => u.impact_level === "Low").length;

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <Header
        right={
          <>
            <Link href="/dashboard" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none", fontWeight: 500 }}>
              My Dashboard
            </Link>
            <button
              onClick={triggerFetch}
              disabled={refreshing}
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: refreshing ? "#9CA3AF" : "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: refreshing ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)"
              }}
            >
              {refreshing ? "Fetching..." : "Fetch Latest"}
            </button>
          </>
        }
      />

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "48px 32px 28px" }}>
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
          marginBottom: 18,
          fontFamily: "var(--font-mono)"
        }}>
          Auto-Updated · AI-Analyzed · Public
        </div>

        <h1 style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: "-0.6px",
          lineHeight: 1.2,
          color: "var(--foreground)",
          maxWidth: 520,
          margin: "0 auto 12px",
          fontFamily: "var(--font-display)"
        }}>
          Base Upgrade Feed
        </h1>

        <p style={{
          color: "var(--muted)",
          maxWidth: 420,
          margin: "0 auto",
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "var(--font-body)"
        }}>
          Automatically fetched and analyzed Base upgrades. No login required.
        </p>

        {message && (
          <p style={{
            marginTop: 18,
            fontSize: 13,
            color: message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") ? "var(--crimson)" : "var(--green)",
            fontWeight: 600,
            fontFamily: "var(--font-mono)"
          }}>
            {message}
          </p>
        )}
      </section>

      {/* STATS + FILTERS + SEARCH */}
      {!loading && upgrades.length > 0 && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px 20px", width: "100%" }}>

          {/* STATS ROW */}
          <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "Total Tracked", value: upgrades.length, color: "var(--accent)" },
              { label: "High Impact", value: highCount, color: "var(--crimson)" },
              { label: "Medium Impact", value: mediumCount, color: "var(--amber)" },
              { label: "Low Impact", value: lowCount, color: "var(--green)" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "var(--card-elevated)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-md)",
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                flex: 1,
                minWidth: 110,
                boxShadow: "var(--shadow-sm)"
              }}>
                <span style={{
                  fontSize: 23,
                  fontWeight: 800,
                  color: stat.color,
                  fontFamily: "var(--font-mono)"
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)"
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              fontSize: 14,
              pointerEvents: "none"
            }}>
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search upgrades by keyword..."
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px 11px 38px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)",
                background: "var(--card-elevated)",
                fontSize: 13.5,
                color: "var(--foreground)",
                outline: "none",
                fontFamily: "var(--font-body)",
                boxSizing: "border-box"
              }}
            />
            {search && (
              <button
                onClick={() => updateSearch("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* FILTER BUTTONS */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {(["All", "High", "Medium", "Low"] as FilterLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => updateFilter(level)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid",
                  borderColor: filter === level ? filterColor(level) : "var(--border)",
                  background: filter === level ? filterBg(level) : "transparent",
                  color: filter === level ? filterColor(level) : "var(--muted)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em"
                }}
              >
                {level}
              </button>
            ))}
            {search && (
              <span style={{
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "var(--font-mono)"
              }}>
                {filteredUpgrades.length} result{filteredUpgrades.length !== 1 ? "s" : ""} for &quot;{search}&quot;
              </span>
            )}
          </div>
        </div>
      )}

      {/* FEED */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px 24px", width: "100%", flex: 1 }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 40, fontFamily: "var(--font-mono)" }}>
            Loading upgrades...
          </p>
        ) : upgrades.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16, fontFamily: "var(--font-body)" }}>
              No upgrades yet. Click Fetch Latest to pull from Base GitHub.
            </p>
            <button
              onClick={triggerFetch}
              disabled={refreshing}
              style={{
                padding: "12px 24px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-display)"
              }}
            >
              {refreshing ? "Fetching..." : "Fetch Now"}
            </button>
          </div>
        ) : filteredUpgrades.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 40, fontFamily: "var(--font-mono)" }}>
            No results found. Try a different keyword or filter.
          </p>
        ) : (
          <>
            {pagedUpgrades.map((upgrade) => (
              <div key={upgrade.id}>
                <UpgradeCard data={upgrade} isNew={false} />
                {upgrade.source_url && (
                  <div style={{ marginTop: -12, marginBottom: 20, paddingLeft: 4 }}>
                    <a
                      href={upgrade.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)" }}
                    >
                      View original release ↗
                    </a>
                  </div>
                )}
              </div>
            ))}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      <Footer />

    </main>
  );
}

function filterColor(level: FilterLevel): string {
  if (level === "High") return "var(--crimson)";
  if (level === "Medium") return "var(--amber)";
  if (level === "Low") return "var(--green)";
  return "var(--accent)";
}

function filterBg(level: FilterLevel): string {
  if (level === "High") return "#B0202A18";
  if (level === "Medium") return "#A6740F18";
  if (level === "Low") return "#1F7A4C18";
  return "var(--accent-soft)";
}
