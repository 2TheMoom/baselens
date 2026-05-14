"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ background: "#E9E6DF", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-heading)" }}>

      {/* HEADER */}
      <header style={{
        borderBottom: "1px solid #D4D0C8",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#E9E6DF"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#1F3A8F",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: "#161719" }}>BaseLens</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/feed" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
            Public Feed
          </Link>
          <Link href="/login" style={{
            fontSize: 13,
            color: "#fff",
            background: "#1F3A8F",
            padding: "7px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700
          }}>
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 32px 60px", flex: 1 }}>
        <div style={{
          display: "inline-block",
          background: "#1F3A8F18",
          color: "#1F3A8F",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "4px 14px",
          borderRadius: 20,
          marginBottom: 24,
          fontFamily: "var(--font-mono)"
        }}>
          Base Upgrade Intelligence
        </div>

        <h1 style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          color: "#161719",
          maxWidth: 680,
          margin: "0 auto 20px",
          fontFamily: "var(--font-heading)"
        }}>
          Understand Every<br />
          <span style={{ color: "#1F3A8F" }}>Base Upgrade</span> Clearly
        </h1>

        <p style={{
          color: "#6B7280",
          maxWidth: 480,
          margin: "0 auto 40px",
          fontSize: 16,
          lineHeight: 1.7
        }}>
          BaseLens transforms complex Base blockchain upgrade announcements into structured, easy-to-understand insights. Built for Web3 users, creators, and developers.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "14px 28px",
            borderRadius: 12,
            background: "#1F3A8F",
            color: "#fff",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em"
          }}>
            Get Started Free
          </Link>
          <Link href="/feed" style={{
            padding: "14px 28px",
            borderRadius: 12,
            background: "transparent",
            color: "#161719",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
            border: "1.5px solid #D4D0C8"
          }}>
            View Public Feed
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>

          {[
            {
              icon: "🤖",
              title: "AI-Powered Analysis",
              desc: "Every upgrade is analyzed by AI and broken into clear sections — what changed, why it changed, and how it affects you."
            },
            {
              icon: "🔵",
              title: "Base-Specific Intel",
              desc: "Focused exclusively on Base blockchain upgrades. No noise, no distractions — just Base intelligence."
            },
            {
              icon: "⚡",
              title: "Auto-Fetched Feed",
              desc: "BaseLens monitors Base GitHub repos automatically and analyzes new releases every 6 hours — no input needed."
            },
            {
              icon: "🔒",
              title: "Your Private Dashboard",
              desc: "Analyze your own upgrades and build a personal feed. Your data stays private with row-level security."
            },
            {
              icon: "🌐",
              title: "Public Intelligence Feed",
              desc: "Browse the shared public feed of auto-analyzed Base upgrades. No login required."
            },
            {
              icon: "📊",
              title: "Structured Insights",
              desc: "Every analysis includes impact level, category, user impact, developer impact, and significance — all in one card."
            }
          ].map((feature, i) => (
            <div key={i} style={{
              background: "#F0EDE7",
              border: "1px solid #D4D0C8",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#161719", marginBottom: 8 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "#1F3A8F",
        padding: "60px 32px",
        textAlign: "center"
      }}>
        <h2 style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 12,
          letterSpacing: "-0.5px"
        }}>
          Stay ahead of every Base upgrade
        </h2>
        <p style={{ color: "#ffffff99", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Join BaseLens and never miss what matters on Base again.
        </p>
        <Link href="/login" style={{
          padding: "14px 32px",
          borderRadius: 12,
          background: "#fff",
          color: "#1F3A8F",
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: "0.02em"
        }}>
          Get Started Free
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #D4D0C8",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 13,
        color: "#6B7280",
        background: "#E9E6DF"
      }}>
        <span>Built by</span>
        <a href="https://x.com/olumi441" target="_blank" rel="noopener noreferrer"
          style={{ color: "#1F3A8F", fontWeight: 700, textDecoration: "none" }}>
          Abu Olumi
        </a>
        <span>·</span>
        <a href="https://github.com/2TheMoom/baselens" target="_blank" rel="noopener noreferrer"
          style={{ color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
          GitHub
        </a>
      </footer>

    </main>
  );
}