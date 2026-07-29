"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

const FEATURES = [
  {
    icon: "◈",
    title: "AI-Powered Analysis",
    desc: "Every upgrade is analyzed by AI and broken into clear sections — what changed, why it changed, and how it affects you."
  },
  {
    icon: "⬡",
    title: "Base-Specific Intel",
    desc: "Focused exclusively on Base blockchain upgrades. No noise, no distractions — just Base intelligence."
  },
  {
    icon: "◎",
    title: "Auto-Fetched Feed",
    desc: "BaseLens monitors Base's GitHub repositories automatically and analyzes new releases as they ship — no input needed."
  },
  {
    icon: "◐",
    title: "Your Private Dashboard",
    desc: "Analyze your own upgrades and build a personal feed. Your data stays private with row-level security."
  },
  {
    icon: "◫",
    title: "Public Intelligence Feed",
    desc: "Browse the shared public feed of auto-analyzed Base upgrades. No login required."
  },
  {
    icon: "▤",
    title: "Structured Insights",
    desc: "Every analysis includes impact level, category, user impact, developer impact, and significance — all in one card."
  }
];

export default function LandingPage() {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowBack(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <Header
        right={
          <>
            <Link href="/feed" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none", fontWeight: 500 }}>
              Public Feed
            </Link>
            <Link href="/login" style={{
              fontSize: 13.5,
              color: "var(--background)",
              background: "var(--ink)",
              padding: "8px 18px",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              fontWeight: 600
            }}>
              Sign in
            </Link>
          </>
        }
      />

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "100px 32px 68px", flex: 1 }}>
        <div style={{
          display: "inline-block",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "5px 16px",
          borderRadius: "var(--radius-full)",
          marginBottom: 30,
          fontFamily: "var(--font-mono)"
        }}>
          Base Upgrade Intelligence
        </div>

        <h1 style={{
          fontSize: 60,
          fontWeight: 600,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          color: "var(--ink)",
          maxWidth: 720,
          margin: "0 auto 24px",
          fontFamily: "var(--font-display)"
        }}>
          Understand every<br />
          <span style={{ fontStyle: "italic", fontWeight: 600, color: "var(--accent)" }}>
            Base upgrade
          </span>, clearly
        </h1>

        <p style={{
          color: "var(--muted)",
          maxWidth: 480,
          margin: "0 auto 44px",
          fontSize: 16.5,
          lineHeight: 1.7,
          fontFamily: "var(--font-body)"
        }}>
          BaseLens transforms complex Base blockchain upgrade announcements into structured, easy-to-understand insights. Built for Web3 users, creators, and developers.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "15px 30px",
            borderRadius: "var(--radius-md)",
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.01em",
            boxShadow: "var(--shadow-md)"
          }}>
            Get Started Free
          </Link>
          <Link href="/feed" style={{
            padding: "15px 30px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            color: "var(--ink)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
            border: "1.5px solid var(--border)"
          }}>
            View Public Feed
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px 96px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 }}>
          {FEATURES.map((feature, i) => (
            <div key={i} style={{
              background: "var(--card-elevated)",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--radius-lg)",
              padding: "26px 24px",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 0.2s ease, transform 0.2s ease"
            }}>
              <div style={{
                width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
                color: "var(--ink)",
                background: "var(--border-soft)",
                borderRadius: "var(--radius-sm)",
                marginBottom: 16
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)", marginBottom: 8, fontFamily: "var(--font-display)", letterSpacing: "-0.1px" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-body)" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "var(--ink)",
        padding: "72px 32px",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: 34, fontWeight: 600, fontStyle: "italic", color: "#fff", marginBottom: 14, letterSpacing: "-0.3px", fontFamily: "var(--font-display)" }}>
          Stay ahead of every Base upgrade
        </h2>
        <p style={{ color: "#ffffffa8", fontSize: 15, maxWidth: 400, margin: "0 auto 36px", fontFamily: "var(--font-body)", lineHeight: 1.6 }}>
          Join BaseLens and never miss what matters on Base again.
        </p>
        <Link href="/login" style={{
          padding: "15px 34px",
          borderRadius: "var(--radius-md)",
          background: "var(--accent)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.02em"
        }}>
          Get Started Free
        </Link>
      </section>

      <Footer />

      {/* BACK TO TOP BUTTON */}
      {showBack && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--ink)",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50
          }}
        >
          ↑
        </button>
      )}

    </main>
  );
}
