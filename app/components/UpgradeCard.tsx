type Props = {
  upgrade: any;
};

export default function UpgradeCard({ upgrade }: Props) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E6E8EC",
        borderRadius: 14,
        padding: 20,
        marginBottom: 16
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{upgrade.title}</h2>
        <span style={{ fontSize: 12, color: "#6B7C93" }}>
          {upgrade.impact_level}
        </span>
      </div>

      <p style={{ color: "#5B6472" }}>{upgrade.summary}</p>

      <Section title="What changed" items={upgrade.what_changed} />
      <Section title="Why it changed" items={upgrade.why_it_changed} />
      <Section title="User impact" items={upgrade.user_impact} />
      <Section title="Developer impact" items={upgrade.developer_impact} />
    </div>
  );
}

function Section({ title, items }: any) {
  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ fontSize: 13 }}>{title}</h4>
      <ul style={{ paddingLeft: 16, color: "#8A94A6" }}>
        {items.map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}