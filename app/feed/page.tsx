"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/lsupabase";
import UpgradeCard from "../components/UpgradeCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import SubscribeForm from "../components/SubscribeForm";

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
  source_type?: string;
  created_at: string;
  _key?: number;
};

type FilterLevel = "All" | "High" | "Medium" | "Low";

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const [upgrades, setUpgrades] = useState<PublicUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterLevel>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCommunityItem, setSelectedCommunityItem] = useState<PublicUpgrade | null>(null);

  const searchParams = useSearchParams();
  const subscribeStatus = searchParams.get("subscribe");
  const subscribeBanner =
    subscribeStatus === "confirmed" ? "You're subscribed — we'll email you when new upgrades ship." :
    subscribeStatus === "unsubscribed" ? "You've been unsubscribed from the digest." :
    subscribeStatus === "invalid" ? "That link is invalid or has expired." :
    "";

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

  // Kept visually and structurally separate so the two never blur together:
  // community announcements (Farcaster / manually curated) get their own
  // strip above, while the stats/search/impact-filter/pagination apparatus
  // below only ever operates on developer releases.
  const communityUpgrades = useMemo(
    () => upgrades.filter((u) => u.source_type === "community"),
    [upgrades]
  );
  const releaseUpgrades = useMemo(
    () => upgrades.filter((u) => u.source_type !== "community"),
    [upgrades]
  );

  const filteredUpgrades = useMemo(() => {
    return releaseUpgrades
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
  }, [releaseUpgrades, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUpgrades.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUpgrades = filteredUpgrades.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const highCount = releaseUpgrades.filter((u) => u.impact_level === "High").length;
  const mediumCount = releaseUpgrades.filter((u) => u.impact_level === "Medium").length;
  const lowCount = releaseUpgrades.filter((u) => u.impact_level === "Low").length;

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

        {subscribeBanner && (
          <p style={{
            marginTop: 18,
            fontSize: 13,
            color: "var(--green)",
            fontWeight: 600,
            fontFamily: "var(--font-mono)"
          }}>
            {subscribeBanner}
          </p>
        )}

        <div style={{ marginTop: 24 }}>
          <SubscribeForm />
        </div>
      </section>

      {/* COMMUNITY SECTION — a fixed-height horizontal strip so it stays the
          same size whether there's 1 update or 20, instead of a vertical
          stack of full cards that grows without bound */}
      {!loading && communityUpgrades.length > 0 && (
        <div style={{
          width: "100%",
          background: "var(--accent-soft)",
          borderTop: "1px solid #C2481E25",
          borderBottom: "1px solid #C2481E25",
          padding: "20px 0"
        }}>
          <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 14,
              fontFamily: "var(--font-mono)"
            }}>
              Community — from Base
            </p>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 6 }}>
              {communityUpgrades.map((upgrade) => (
                <div
                  key={upgrade.id}
                  onClick={() => setSelectedCommunityItem(upgrade)}
                  style={{
                    flex: "0 0 auto",
                    width: 300,
                    background: "var(--card-elevated)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "var(--radius-md)",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: "var(--shadow-sm)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{
                    alignSelf: "flex-start",
                    fontSize: 10,
                    padding: "3px 9px",
                    borderRadius: "var(--radius-full)",
                    background: filterBg(upgrade.impact_level as FilterLevel),
                    color: filterColor(upgrade.impact_level as FilterLevel),
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    fontFamily: "var(--font-mono)"
                  }}>
                    {upgrade.impact_level}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--foreground)",
                    lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden"
                  }}>
                    {upgrade.title}
                  </span>
                  <span style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    fontFamily: "var(--font-body)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden"
                  }}>
                    {upgrade.summary}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{
                      fontSize: 12,
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600
                    }}>
                      Read full analysis →
                    </span>
                    {upgrade.source_url && (
                      <a
                        href={upgrade.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          textDecoration: "none"
                        }}
                      >
                        Source ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY ITEM MODAL — full AI analysis, not just a link out to a
          source that may not even exist for manually-curated items */}
      {selectedCommunityItem && (
        <div
          onClick={() => setSelectedCommunityItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 21, 26, 0.55)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 20px",
            overflowY: "auto",
            zIndex: 100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, width: "100%" }}
          >
            <button
              onClick={() => setSelectedCommunityItem(null)}
              style={{
                display: "block",
                marginLeft: "auto",
                marginBottom: 10,
                background: "var(--card-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                width: 32,
                height: 32,
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 14
              }}
              aria-label="Close"
            >
              ✕
            </button>
            <UpgradeCard data={selectedCommunityItem} isNew={false} expanded={true} onToggle={() => {}} />
            {selectedCommunityItem.source_url && (
              <div style={{ marginTop: -12, paddingLeft: 4 }}>
                <a
                  href={selectedCommunityItem.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)" }}
                >
                  View original post ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATS + FILTERS + SEARCH */}
      {!loading && releaseUpgrades.length > 0 && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 20px 20px", width: "100%" }}>

          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 14,
            fontFamily: "var(--font-mono)"
          }}>
            Upgrades — from GitHub
          </p>

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
        ) : releaseUpgrades.length === 0 ? (
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
                <UpgradeCard
                  data={upgrade}
                  isNew={false}
                  expanded={expandedId === upgrade.id}
                  onToggle={() => setExpandedId((prev) => (prev === upgrade.id ? null : upgrade.id))}
                />
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
