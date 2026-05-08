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
      if (current >= total) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isNew, sections.length]);

  if (!data) return null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E4DE",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{data.title}</h2>
        <span style={impactStyle(data.impact_level)}>{data.impact_level}</span>
      </div>

      {/* CATEGORY */}
      {data.category && (
        <div style={{ marginTop: 6 }}>
          <span style={categoryStyle}>{data.category}</span>
        </div>
      )}

      {/* ANIMATED SECTIONS */}
      {sections.map((section, index) => {
        const visible = visibleSections > index;

        if (section.type === "summary") {
          return (
            <p
              key={index}
              style={{
                color: "#5B6472",
                marginTop: 10,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease"
              }}
            >
              {section.content}
            </p>
          );
        }

        if (section.type === "significance") {
          return section.content ? (
            <div
              key={index}
              style={{
                background: "#F9F7F3",
                padding: 12,
                borderRadius: 10,
                marginTop: 12,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease"
              }}
            >
              <strong style={{ fontSize: 13 }}>Why this matters</strong>
              <p style={{ margin: 0, color: "#6B7280" }}>{section.content}</p>
            </div>
          ) : null;
        }

        return (
          <div
            key={index}
            style={{
              marginTop: 14,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease, transform 0.5s ease"
            }}
          >
            <h4 style={{ fontSize: 13, marginBottom: 6 }}>{section.title}</h4>
            <p style={{ color: "#8A94A6", margin: 0 }}>{section.content}</p>
          </div>
        );
      })}
    </div>
  );
}

function impactStyle(level: string) {
  if (level === "High") {
    return { fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#FFECEC", color: "#D64545" };
  }
  if (level === "Medium") {
    return { fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#FFF6E5", color: "#B78103" };
  }
  return { fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#EEF6FF", color: "#2F6FED" };
}

const categoryStyle = {
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 20,
  background: "#EFEDE8",
  color: "#555",
  display: "inline-block" as const
};