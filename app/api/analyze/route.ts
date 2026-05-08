import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No input text provided" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        error: "API key is missing",
        hint: "Check your .env.local file and restart server"
      });
    }

    const systemPrompt = `
You are a senior blockchain upgrade analyst writing for a Web3 intelligence platform.

Your job is to deeply analyze blockchain upgrade announcements and return rich, detailed insights.

Rules:
- Write a UNIQUE, specific, descriptive title (not generic)
- summary: 3-4 sentences explaining the upgrade in plain English for non-technical users
- category: one of: Security, Performance, Feature, Infrastructure, Governance
- what_changed: 3-5 sentences describing exactly what was modified, added, or removed
- why_it_changed: 3-4 sentences explaining the technical or strategic reason behind the change
- user_impact: 3-4 sentences on how this affects everyday users, airdrop farmers, and creators
- developer_impact: 3-4 sentences on how this affects developers building on the protocol
- significance_reason: 3-4 sentences on why this upgrade matters for the broader ecosystem
- impact_level: one of: High, Medium, Low — based on how much this changes the protocol

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

    if (!raw) {
      return NextResponse.json({ error: "No AI response", raw: data });
    }

    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "Parsing failed", raw });
    }

  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("FULL ERROR:", err);
    return NextResponse.json({ error: "Server error", message });
  }
}