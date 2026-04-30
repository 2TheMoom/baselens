export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // 🔒 PUT YOUR REAL OPENAI API KEY HERE
    const OPENAI_API_KEY = "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";

    if (!OPENAI_API_KEY) {
      return Response.json({ error: "API key missing" });
    }

    const systemPrompt = `
You are an expert blockchain upgrade analyst.

Rules:
- Always generate a UNIQUE and descriptive title
- Avoid repeating generic titles like "Base Upgrade"
- Make titles specific to the change

Return ONLY valid JSON:

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
        Authorization: `Bearer ${OPENAI_API_KEY}`
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