import { ReactNode } from "react";
import Logo from "./Logo";

type Props = {
  right?: ReactNode;
};

export default function Header({ right }: Props) {
  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      padding: "18px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--background)",
      position: "sticky",
      top: 0,
      zIndex: 40,
      backdropFilter: "blur(6px)"
    }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {right}
      </div>
    </header>
  );
}
