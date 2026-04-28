export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // 🔍 DEBUG: Check if API key is loading
    console.log("🔑 API KEY VALUE:", process.env.OPENAI_API_KEY);

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        error: "API key is missing",
        hint: "Check your .env.local file and restart server"
      });
    }

    if (!text || !text.trim()) {
      return Response.json({ error: "No input text provided" });
    }

    const systemPrompt = `
You are a blockchain upgrade analyst for the Base ecosystem.

Return JSON with:
title, summary, what_changed, why_it_changed,
user_impact, developer_impact, impact_level.

Do NOT include anything outside JSON.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();

    console.log("🔍 OPENAI RESPONSE:", data);

    if (!response.ok) {
      return Response.json({
        error: "OpenAI API error",
        details: data,
      });
    }

    if (!data.choices || !data.choices[0]) {
      return Response.json({
        error: "Invalid response structure",
        data,
      });
    }

    const raw = data.choices[0].message.content;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return Response.json(parsed);
    } catch {
      return Response.json({
        error: "JSON parsing failed",
        raw_output: raw,
      });
    }
  } catch (err: any) {
    console.error("🔥 SERVER ERROR:", err);

    return Response.json({
      error: "Server crashed",
      message: err.message,
    });
  }
}