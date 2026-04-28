type Props = {
  data: any;
};

export default function UpgradeCard({ data }: Props) {
  if (!data) return null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E4DE",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{data.title}</h2>

        <span
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 20,
            background:
              data.impact_level === "High"
                ? "#FFECEC"
                : data.impact_level === "Medium"
                ? "#FFF6E5"
                : "#EEF6FF",
            color:
              data.impact_level === "High"
                ? "#D64545"
                : data.impact_level === "Medium"
                ? "#B78103"
                : "#2F6FED"
          }}
        >
          {data.impact_level}
        </span>
      </div>

      {/* SUMMARY */}
      <p style={{ color: "#5B6472", marginTop: 10 }}>{data.summary}</p>

      {/* SECTIONS */}
      <Section title="What changed" content={data.what_changed} />
      <Section title="Why it changed" content={data.why_it_changed} />
      <Section title="User impact" content={data.user_impact} />
      <Section title="Developer impact" content={data.developer_impact} />
    </div>
  );
}

function Section({ title, content }: any) {
  return (
    <div style={{ marginTop: 14 }}>
      <h4 style={{ fontSize: 13, marginBottom: 6 }}>{title}</h4>
      <p style={{ color: "#8A94A6", margin: 0 }}>{content}</p>
    </div>
  );
}