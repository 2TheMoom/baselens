import UpgradeCard from "./UpgradeCard";
import Pagination from "./Pagination";

const PAGE_SIZE = 6;

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

type Props = {
  results: UpgradeResult[];
  page: number;
  onPageChange: (page: number) => void;
};

export default function Feed({ results, page, onPageChange }: Props) {
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
      {paged.map(({ item, index }) => (
        <UpgradeCard
          key={item._key || index}
          data={item}
          isNew={index === 0 && !!item._key}
        />
      ))}
      <Pagination page={currentPage} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
