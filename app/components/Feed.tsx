import { mockUpgrades } from "../data/mockUpgrades";
import UpgradeCard from "./UpgradeCard";

export default function Feed() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      {mockUpgrades.map((upgrade, i) => (
        <UpgradeCard key={i} upgrade={upgrade} />
      ))}
    </div>
  );
}