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
};

export default function UpgradeCard({ data, isNew = false }: Props) {
  const sections: SectionItem[] = [
    { title: "Summary", content: data.summary, type: "summary" },
    { title: "Why this matters", content: data.significance_reason, type: "significance" },
    { title: "What changed", content: data.what_changed, type: "section" },
    { title: "Why it changed", content: data.why_it_changed, type: "section" },
    { title: "User impact", content: data.user_impact, type: "section" },
    { title: "Developer impact", content: data.developer_impact, type: "section" },
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
      background: "#F0EDE7",
      border: "1px solid #D4D0C8",
      borderRadius: 16,
      padding: "24px 28px",
      marginBottom: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
    }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <h2 style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
          color: "#161719",
          fontFamily: "var(--font-heading)"
        }}>
          {data.title}
        </h2>
        <span style={impactStyle(data.impact_level)}>{data.impact_level}</span>
      </div>

      {/* CATEGORY */}
      {data.category && (
        <div style={{ marginTop: 10 }}>
          <span style={{
            fontSize: 11,
            padding: "3px 10px",
            borderRadius: 20,
            background: "#1F3A8F18",
            color: "#1F3A8F",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            fontFamily: "var(--font-mono)"
          }}>
            {data.category}
          </span>
        </div>
      )}

      {/* DIVIDER */}
      <div style={{ height: 1, background: "#D4D0C8", margin: "16px 0" }} />

      {/* ANIMATED SECTIONS */}
      {sections.map((section, index) => {
        const visible = visibleSections > index;

        if (section.type === "summary") {
          return (
            <p key={index} style={{
              color: "#161719",
              fontSize: 14,
              lineHeight: 1.7,
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
              background: "#1F3A8F12",
              border: "1px solid #1F3A8F30",
              padding: "12px 16px",
              borderRadius: 10,
              marginTop: 14,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease"
            }}>
              <strong style={{
                fontSize: 11,
                color: "#1F3A8F",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                fontFamily: "var(--font-mono)"
              }}>
                Why this matters
              </strong>
              <p style={{ margin: "4px 0 0", color: "#161719", fontSize: 13, lineHeight: 1.6 }}>
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#6B7280",
              marginBottom: 6,
              fontFamily: "var(--font-mono)"
            }}>
              {section.title}
            </h4>
            <p style={{ color: "#161719", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {section.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function impactStyle(level: string) {
  const base = {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.06em"
  };
  if (level === "High") return { ...base, background: "#B01C2E18", color: "#B01C2E" };
  if (level === "Medium") return { ...base, background: "#FFF6E5", color: "#B78103" };
  return { ...base, background: "#1A6B3C18", color: "#1A6B3C" };
}