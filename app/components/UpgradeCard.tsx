"use client";

import { useEffect, useState } from "react";

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
  source_type?: string;
  _key?: number;
};

type SectionItem = {
  title: string;
  content: string;
  type: string;
};

type Props = {
  data: UpgradeResult;
  isNew?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onPublish?: (sourceUrl: string) => void | Promise<void>;
  published?: boolean;
};

export default function UpgradeCard({ data, isNew = false, expanded = false, onToggle, onPublish, published = false }: Props) {
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [sourceUrlInput, setSourceUrlInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  // Ordered for a general Base user first, developer detail last: plain-language
  // summary and personal impact lead, the technical changelog detail and the
  // developer-specific section come after, visually separated below.
  const sections: SectionItem[] = [
    { title: "Summary", content: data.summary, type: "summary" },
    { title: "What this means for you", content: data.user_impact, type: "section" },
    { title: "Why this matters", content: data.significance_reason, type: "significance" },
    { title: "Why it changed", content: data.why_it_changed, type: "section" },
    { title: "What changed", content: data.what_changed, type: "section" },
    { title: "For developers", content: data.developer_impact, type: "developer" },
  ];

  const [visibleSections, setVisibleSections] = useState(isNew ? 0 : 99);

  useEffect(() => {
    if (!isNew) return;
    let current = 0;
    const total = sections.length + 1;
    const interval = setInterval(() => {
      current += 1;
      setVisibleSections(current);
      if (current >= total) clearInterval(interval);
    }, 300);
    return () => clearInterval(interval);
  }, [isNew, sections.length]);

  if (!data) return null;

  return (
    <div style={{
      background: "var(--card-elevated)",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--radius-lg)",
      padding: "22px 26px",
      marginBottom: 16,
      boxShadow: "var(--shadow-sm)",
      transition: "box-shadow 0.2s ease"
    }}>

      {/* HEADER — always visible, click to expand/collapse */}
      <div
        onClick={() => { if (!isNew) onToggle?.(); }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          cursor: isNew ? "default" : "pointer"
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.3px",
            lineHeight: 1.3,
            color: "var(--foreground)",
            fontFamily: "var(--font-display)"
          }}>
            {data.title}
          </h2>

          {/* CATEGORY + SOURCE TYPE */}
          {(data.category || data.source_type === "community") && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {data.source_type === "community" && (
                <span style={{
                  fontSize: 10,
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  fontFamily: "var(--font-mono)"
                }}>
                  Community
                </span>
              )}
              {data.category && (
                <span style={{
                  fontSize: 10,
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--border-soft)",
                  color: "var(--muted)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  fontFamily: "var(--font-mono)"
                }}>
                  {data.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={impactStyle(data.impact_level)}>{data.impact_level}</span>
          {!isNew && (
            <span style={{
              fontSize: 11,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              userSelect: "none"
            }}>
              {expanded ? "▲" : "▼"}
            </span>
          )}
        </div>
      </div>

      {/* EXPANDABLE CONTENT */}
      {(expanded || isNew) && (
        <>
          {/* DIVIDER */}
          <div style={{
            height: 1,
            background: "var(--border)",
            margin: "16px 0"
          }} />

          {/* ANIMATED SECTIONS */}
          {sections.map((section, index) => {
            const visible = visibleSections > index;

            if (section.type === "summary") {
              return (
                <p key={index} style={{
                  color: "var(--foreground)",
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease"
                }}>
                  {section.content}
                </p>
              );
            }

            if (section.type === "significance") {
              return section.content ? (
                <div key={index} style={{
                  background: "var(--accent-soft)",
                  border: "1px solid #C2481E25",
                  padding: "13px 16px",
                  borderRadius: "var(--radius-sm)",
                  marginTop: 14,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease"
                }}>
                  <strong style={{
                    fontSize: 10,
                    color: "var(--accent)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    fontFamily: "var(--font-mono)"
                  }}>
                    Why this matters
                  </strong>
                  <p style={{ margin: "5px 0 0", color: "var(--foreground)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                    {section.content}
                  </p>
                </div>
              ) : null;
            }

            if (section.type === "developer") {
              return section.content ? (
                <div key={index} style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px dashed var(--border)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease"
                }}>
                  <h4 style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: "var(--muted)",
                    marginBottom: 6,
                    fontFamily: "var(--font-mono)"
                  }}>
                    {section.title}
                  </h4>
                  <p style={{ color: "var(--foreground)", fontSize: 13.5, lineHeight: 1.7, margin: 0, fontFamily: "var(--font-body)" }}>
                    {section.content}
                  </p>
                </div>
              ) : null;
            }

            return (
              <div key={index} style={{
                marginTop: 16,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease"
              }}>
                <h4 style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontFamily: "var(--font-mono)"
                }}>
                  {section.title}
                </h4>
                <p style={{ color: "var(--foreground)", fontSize: 13.5, lineHeight: 1.7, margin: 0, fontFamily: "var(--font-body)" }}>
                  {section.content}
                </p>
              </div>
            );
          })}

          {/* PUBLISH TO COMMUNITY FEED — only rendered when the parent passes onPublish (dashboard context) */}
          {onPublish && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
              {published ? (
                <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  ✓ Published to community feed
                </span>
              ) : showPublishForm ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    type="url"
                    placeholder="Source URL (optional) — link to the original post"
                    value={sourceUrlInput}
                    onChange={(e) => setSourceUrlInput(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1.5px solid var(--border)",
                      background: "var(--background)",
                      fontSize: 13,
                      color: "var(--foreground)",
                      outline: "none",
                      fontFamily: "var(--font-body)"
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setPublishing(true);
                        try {
                          await onPublish(sourceUrlInput.trim());
                        } finally {
                          setPublishing(false);
                          setShowPublishForm(false);
                        }
                      }}
                      disabled={publishing}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: publishing ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-display)"
                      }}
                    >
                      {publishing ? "Publishing..." : "Confirm publish"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowPublishForm(false); }}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--muted)",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-display)"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPublishForm(true); }}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: "var(--card-elevated)",
                    color: "var(--foreground)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)"
                  }}
                >
                  Publish to Community Feed
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function impactStyle(level: string) {
  const base = {
    fontSize: 10,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.06em"
  };
  if (level === "High") return { ...base, background: "#B0202A18", color: "#B0202A" };
  if (level === "Medium") return { ...base, background: "#A6740F18", color: "#A6740F" };
  return { ...base, background: "#1F7A4C18", color: "#1F7A4C" };
}