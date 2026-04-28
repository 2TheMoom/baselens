import UpgradeCard from "./UpgradeCard";

type Props = {
  results: any[];
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
        <UpgradeCard key={index} data={item} />
      ))}
    </div>
  );
}