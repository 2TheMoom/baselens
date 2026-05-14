import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaseLens — Base Upgrade Intelligence",
  description: "Understand Base blockchain upgrades clearly. AI-powered structured insights for every protocol change.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}