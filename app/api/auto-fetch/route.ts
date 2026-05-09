import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GITHUB_API = "https://api.github.com/repos/base-org/node/releases";

async function analyzeWithAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI key");

  const systemPrompt = `
You are a senior blockchain upgrade analyst writing for a Web3 intelligence platform.
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
    // 🔍 Fetch latest releases from Base GitHub
    const res = await fetch(GITHUB_API, {
      headers: {
        "User-Agent": "BaseLens-App",
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub releases" }, { status: 500 });
    }

    const releases = await res.json();

    if (!releases || releases.length === 0) {
      return NextResponse.json({ message: "No releases found" });
    }

    let newCount = 0;
    let skippedCount = 0;

    for (const release of releases.slice(0, 5)) {
      const title = release.name || release.tag_name;
      const body = release.body || "";
      const sourceUrl = release.html_url;

      if (!body || body.length < 50) {
        skippedCount++;
        continue;
      }

      // 🛡️ Check if already analyzed
      const { data: existing } = await supabase
        .from("public_upgrades")
        .select("id")
        .eq("source_url", sourceUrl)
        .limit(1);

      if (existing && existing.length > 0) {
        skippedCount++;
        continue;
      }

      // 🤖 Analyze with AI
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
        source_url: sourceUrl
      }]);

      if (error) {
        console.error("Insert error:", error);
      } else {
        newCount++;
      }
    }

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