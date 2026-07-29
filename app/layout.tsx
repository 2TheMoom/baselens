import type { Metadata, Viewport } from "next";
import "./globals.css";

const description = "Understand Base blockchain upgrades clearly. AI-powered structured insights for every protocol change.";

export const metadata: Metadata = {
  metadataBase: new URL("https://baselens-psi.vercel.app"),
  title: "BaseLens — Base Upgrade Intelligence",
  description,
  openGraph: {
    title: "BaseLens — Base Upgrade Intelligence",
    description,
    siteName: "BaseLens",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseLens — Base Upgrade Intelligence",
    description
  },
  other: {
    "talentapp:project_verification": "b02178d02154010d562d230b8615638c23036620981c5a624ae117a7bf23165c6b29b53f692ff925bedda7d69ae0f5feca7211e87decc259b5d0fd7cbe30b483"
  }
};

export const viewport: Viewport = {
  themeColor: "#F6F3EC"
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
