import UpgradeCard from "./UpgradeCard";

type Props = {
  result: any;
};

export default function Feed({ result }: Props) {
  if (!result) return null;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
      <UpgradeCard data={result} />
    </div>
  );
}