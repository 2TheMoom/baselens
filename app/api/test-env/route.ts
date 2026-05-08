import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a blockchain upgrade analyst. When given an upgrade announcement, return ONLY a JSON object with these exact fields:
{
  "title": "short title of the upgrade",
  "summary": "2-3 sentence plain English summary",
  "category": "one of: Security, Performance, Feature, Infrastructure",
  "what_changed": "what specifically changed",
  "why_it_changed": "the reason behind this change",
  "user_impact": "how this affects regular users",
  "developer_impact": "how this affects developers",
  "significance_reason": "why this upgrade matters",
  "impact_level": "one of: Low, Medium, High"
}
Return only valid JSON. No extra text.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const raw = completion.choices[0].message.content || "";
    const parsed = JSON.parse(raw);

    return Response.json(parsed);

  } catch (err: any) {
    console.error("Route error:", err);
    return Response.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}