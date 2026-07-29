type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginTop: 24,
      flexWrap: "wrap"
    }}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={pageBtnStyle(false, page === 1)}
      >
        ← Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={pageBtnStyle(n === page, false)}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={pageBtnStyle(false, page === totalPages)}
      >
        Next →
      </button>
    </nav>
  );
}

function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    minWidth: 34,
    height: 34,
    padding: "0 10px",
    borderRadius: "var(--radius-sm)",
    border: "1.5px solid",
    borderColor: active ? "var(--accent)" : "var(--border)",
    background: active ? "var(--accent)" : "var(--card-elevated)",
    color: active ? "#fff" : disabled ? "var(--border)" : "var(--muted)",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-mono)",
    opacity: disabled ? 0.5 : 1
  };
}
