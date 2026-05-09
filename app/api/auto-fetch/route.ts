import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔵 Base-only GitHub sources
const GITHUB_SOURCES = [
  "https://api.github.com/repos/base-org/node/releases",
  "https://api.github.com/repos/base-org/op-enclave/releases",
  "https://api.github.com/repos/base-org/base-node/releases",
  "https://api.github.com/repos/base-org/withdrawer/releases",
  "https://api.github.com/repos/base-org/block-explorer/releases"
];

async function analyzeWithAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI key");

  const systemPrompt = `
You are a senior blockchain upgrade analyst writing for BaseLens, a Web3 intelligence platform focused on Base blockchain upgrades.
Your job is to analyze Base blockchain upgrade announcements and return structured insights.
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
      max_tokens: 1200
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
    console.log("Auto-fetch started — Base-only sources...");

    let newCount = 0;
    let skippedCount = 0;

    for (const sourceUrl of GITHUB_SOURCES) {
      console.log(`Fetching from: ${sourceUrl}`);

      const res = await fetch(sourceUrl, {
        headers: {
          "User-Agent": "BaseLens-App",
          Accept: "application/vnd.github.v3+json"
        }
      });

      console.log(`Status for ${sourceUrl}: ${res.status}`);

      if (!res.ok) {
        console.log(`Skipping source - status ${res.status}`);
        continue;
      }

      const releases = await res.json();

      if (!releases || releases.length === 0) {
        console.log(`No releases found for ${sourceUrl}`);
        continue;
      }

      console.log(`Found ${releases.length} releases`);

      for (const release of releases.slice(0, 3)) {
        const title = release.name || release.tag_name;
        const body = release.body || "";
        const releaseUrl = release.html_url;

        console.log(`Processing: ${title} | body length: ${body.length}`);

        if (!body || body.length < 50) {
          console.log(`Skipping ${title} - body too short`);
          skippedCount++;
          continue;
        }

        // 🛡️ Check if already analyzed
        const { data: existing } = await supabase
          .from("public_upgrades")
          .select("id")
          .eq("source_url", releaseUrl)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`Skipping ${title} - already exists`);
          skippedCount++;
          continue;
        }

        // 🤖 Analyze with AI
        console.log(`Analyzing: ${title}`);
        const content = `${title}\n\n${body}`;
        const analyzed = await analyzeWithAI(content);

        // 💾 Save to public_upgrades
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
          source_url: releaseUrl
        }]);

        if (error) {
          console.error("Insert error:", error);
        } else {
          console.log(`Saved: ${title}`);
          newCount++;
        }
      }
    }

    console.log(`Done. ${newCount} new, ${skippedCount} skipped.`);

    return NextResponse.json({
      message: `Done. ${newCount} new upgrades analyzed, ${skippedCount} skipped.`
    });

  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("Auto-fetch error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}