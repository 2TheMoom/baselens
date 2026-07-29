import Link from "next/link";

type Props = {
  size?: number;
  href?: string;
};

export default function Logo({ size = 34, href = "/" }: Props) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="7" y="6" width="7" height="28" rx="1.5" fill="#14151A" />
      <rect x="7" y="27" width="21" height="7" rx="1.5" fill="#14151A" />
      <circle cx="31" cy="9" r="5.5" fill="#C2481E" />
    </svg>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label="BaseLens home" style={{ display: "inline-flex", lineHeight: 0 }}>
      {mark}
    </Link>
  );
}
