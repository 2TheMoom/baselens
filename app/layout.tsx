import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaseLens — Base Upgrade Intelligence",
  description: "Understand Base blockchain upgrades clearly. AI-powered structured insights for every protocol change.",
  other: {
    "talentapp:project_verification": "b02178d02154010d562d230b8615638c23036620981c5a624ae117a7bf23165c6b29b53f692ff925bedda7d69ae0f5feca7211e87decc259b5d0fd7cbe30b483"
  }
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