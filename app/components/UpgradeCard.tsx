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
};

export default function UpgradeCard({ data, isNew = false, expanded = false, onToggle }: Props) {
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

          {/* CATEGORY */}
          {data.category && (
            <div style={{ marginTop: 8 }}>
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