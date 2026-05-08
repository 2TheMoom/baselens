import UpgradeCard from "./UpgradeCard";

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
};

export default function Feed({ results }: Props) {
  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: 40, color: "#8A94A6" }}>
        No analyses yet. Paste an upgrade above to begin.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
      {results.map((item, index) => (
        <UpgradeCard
          key={item._key || index}
          data={item}
          isNew={index === 0 && !!item._key}
        />
      ))}
    </div>
  );
}