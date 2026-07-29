"use client";

import { useState } from "react";
import UpgradeCard from "./UpgradeCard";
import Pagination from "./Pagination";

const PAGE_SIZE = 6;

type UpgradeResult = {
  id?: string;
  title: string;
  summary: string;
  category: string;
  what_changed: string;
  why_it_changed: string;
  user_impact: string;
  developer_impact: string;
  significance_reason: string;
  impact_level: string;
  published_to_public?: boolean;
  _key?: number;
};

type Props = {
  results: UpgradeResult[];
  page: number;
  onPageChange: (page: number) => void;
  onPublish?: (result: UpgradeResult, sourceUrl: string) => void | Promise<void>;
};

export default function Feed({ results, page, onPageChange, onPublish }: Props) {
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
        No analyses yet. Paste an upgrade above to begin.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = results
    .map((item, index) => ({ item, index }))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 820, margin: "20px auto", padding: "0 20px 20px", width: "100%", boxSizing: "border-box" }}>
      {paged.map(({ item, index }) => {
        const cardKey = item._key || index;
        return (
          <UpgradeCard
            key={cardKey}
            data={item}
            isNew={index === 0 && !!item._key}
            expanded={expandedKey === cardKey}
            onToggle={() => setExpandedKey((prev) => (prev === cardKey ? null : cardKey))}
            onPublish={onPublish ? (sourceUrl) => onPublish(item, sourceUrl) : undefined}
            published={item.published_to_public}
          />
        );
      })}
      <Pagination page={currentPage} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
