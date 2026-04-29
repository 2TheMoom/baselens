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
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{data.title}</h2>

        <span style={impactStyle(data.impact_level)}>
          {data.impact_level}
        </span>
      </div>

      {/* CATEGORY */}
      {data.category && (
        <div style={{ marginTop: 6 }}>
          <span style={categoryStyle}>
            {data.category}
          </span>
        </div>
      )}

      {/* SUMMARY */}
      <p style={{ color: "#5B6472", marginTop: 10 }}>
        {data.summary}
      </p>

      {/* SIGNIFICANCE (NEW ⭐) */}
      {data.significance_reason && (
        <div
          style={{
            background: "#F9F7F3",
            padding: 12,
            borderRadius: 10,
            marginTop: 12
          }}
        >
          <strong style={{ fontSize: 13 }}>
            Why this matters
          </strong>
          <p style={{ margin: 0, color: "#6B7280" }}>
            {data.significance_reason}
          </p>
        </div>
      )}

      {/* DETAILS */}
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

// 🎯 Impact badge styling
function impactStyle(level: string) {
  if (level === "High") {
    return {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 20,
      background: "#FFECEC",
      color: "#D64545"
    };
  }

  if (level === "Medium") {
    return {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 20,
      background: "#FFF6E5",
      color: "#B78103"
    };
  }

  return {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#EEF6FF",
    color: "#2F6FED"
  };
}

// 🏷️ Category badge
const categoryStyle = {
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 20,
  background: "#EFEDE8",
  color: "#555",
  display: "inline-block"
};