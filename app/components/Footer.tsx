export default function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      borderTop: "1px solid var(--border)",
      padding: "24px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12.5,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.02em"
    }}>
      <span>© {new Date().getFullYear()} BaseLens — Base Upgrade Intelligence</span>
    </footer>
  );
}
