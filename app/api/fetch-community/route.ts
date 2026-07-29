import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const maxDuration = 60;

// Base's official Farcaster account — verified public, no auth required.
const BASE_FID = 12142;
const CAST_LIMIT = 20;
// Filters out one-liners (holiday greetings, hiring posts) that aren't real
// announcements — tuned against real @base casts, not a guess.
const MIN_CAST_LENGTH = 150;
const MAX_NEW_PER_RUN = 5;

async function analyzeAnnouncementWithAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI key");

  const systemPrompt = `
You are a senior Web3 ecosystem analyst writing for BaseLens, an intelligence platform focused on Base blockchain.

You will be given a public announcement post from Base's official account. It is a social media post, not a code changelog — do not assume it describes a software release. Analyze it for the broader Base community: everyday users, creators, airdrop farmers, and builders.

Rules:
- Write a clear, descriptive title that identifies what this announcement is about
- summary: 3-4 sentences explaining the announcement in plain English
- category: one of: Feature, Governance, Infrastructure, Maintenance, Security, Performance (use Feature for new products/campaigns/partnerships)
- what_changed: 3-5 sentences on what was introduced, launched, or announced
- why_it_changed: 3-4 sentences on why Base is doing this — the strategic reasoning
- user_impact: 3-4 sentences on how this affects everyday Base users, creators, and airdrop farmers
- developer_impact: 3-4 sentences on how this affects developers/builders on Base — if there's no direct relevance, explain the indirect relevance instead of forcing one
- significance_reason: 3-4 sentences on why this matters for the Base ecosystem broadly
- impact_level: one of: High, Medium, Low based on how significant this announcement is

Return ONLY valid JSON with no extra text, no markdown, no backticks:
{
  "title": string,
  "summary": string,
  "category": string,
  "what_changed": string,
  "why_it_changed": string,
  "user_impact": string,
  "developer_impact": string,
  "significance_reason": string,
  "impact_level": "High" | "Medium" | "Low"
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("No AI response");

  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function GET() {
  try {
    const res = await fetch(
      `https://client.warpcast.com/v2/casts?fid=${BASE_FID}&limit=${CAST_LIMIT}`,
      { headers: { "User-Agent": "BaseLens-App" } }
    );

    if (!res.ok) {
      console.error(`Warpcast API returned ${res.status}`);
      return NextResponse.json({ error: `Warpcast API returned ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const casts = data?.result?.casts;

    if (!Array.isArray(casts)) {
      return NextResponse.json({ error: "Unexpected Warpcast response shape" }, { status: 500 });
    }

    // Root posts only (skip replies — parentHash present means it's a reply),
    // and long enough to be a real announcement, not a one-liner.
    const candidates = casts.filter(
      (c) => !c.parentHash && c.text && c.text.length >= MIN_CAST_LENGTH
    );

    const { data: existingRows } = await supabase.from("public_upgrades").select("source_url");
    const existingUrls = new Set((existingRows || []).map((r) => r.source_url));

    let newCount = 0;
    let skippedCount = 0;

    for (const cast of candidates) {
      if (newCount >= MAX_NEW_PER_RUN) break;

      const sourceUrl = `https://warpcast.com/${cast.author.username}/${cast.hash}`;

      if (existingUrls.has(sourceUrl)) {
        skippedCount++;
        continue;
      }

      try {
        const analyzed = await analyzeAnnouncementWithAI(cast.text);

        const { error } = await supabase.from("public_upgrades").insert([{
          title: analyzed.title,
          summary: analyzed.summary,
          category: analyzed.category,
          what_changed: analyzed.what_changed,
          why_it_changed: analyzed.why_it_changed,
          user_impact: analyzed.user_impact,
          developer_impact: analyzed.developer_impact,
          significance_reason: analyzed.significance_reason,
          impact_level: analyzed.impact_level,
          source_url: sourceUrl,
          source_type: "community"
        }]);

        if (error) {
          console.error("Insert error:", error);
        } else {
          newCount++;
        }
      } catch (err) {
        console.error("Failed to analyze cast:", cast.hash, err);
      }
    }

    return NextResponse.json({
      message: `Done. ${newCount} new community update(s) analyzed, ${skippedCount} skipped, ${candidates.length} candidate(s) scanned.`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("fetch-community error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
