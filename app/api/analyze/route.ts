export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "API key missing" });
    }

    const systemPrompt = `
You are an expert blockchain upgrade analyst.

Your job is to break down protocol upgrades into clear, structured insights.

Return ONLY valid JSON with these fields:

{
  "title": string,
  "summary": string,
  "category": string (one of: Performance, Security, UX, Developer Experience, Infrastructure),
  "what_changed": string,
  "why_it_changed": string,
  "user_impact": string,
  "developer_impact": string,
  "significance_reason": string (explain WHY this upgrade matters in a deeper context),
  "impact_level": string (High, Medium, Low)
}

Rules:
- Be concise but insightful
- Avoid generic statements
- Focus on real implications
- No extra text outside JSON
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        error: "OpenAI error",
        details: data
      });
    }

    const raw = data.choices?.[0]?.message?.content || "";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return Response.json(JSON.parse(cleaned));
    } catch {
      return Response.json({
        error: "Parsing failed",
        raw
      });
    }
  } catch (err: any) {
    return Response.json({
      error: "Server error",
      message: err.message
    });
  }
}