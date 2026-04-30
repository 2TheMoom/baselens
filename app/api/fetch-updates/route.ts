import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // 🔒 Replace with your real values
    const SUPABASE_URL = "https://wqzcqnhtiujalriciydy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemNxbmh0aXVqYWxyaWNpeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDUyMzcsImV4cCI6MjA5Mjk4MTIzN30.w0pSXvGxdDKBD_2-zsxJzcujv8rJD0IgGRufhbgd3Y8";
    const APP_URL = "http://localhost:3000";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const updates = [
      "Base NEW upgrade improves latency 1",
      "Base NEW upgrade improves latency 2",
      "Base NEW upgrade improves latency 3"
    ];

    let insertedCount = 0;

    for (const text of updates) {
      try {
        console.log("Processing:", text);

        const res = await fetch(`${APP_URL}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text })
        });

        const data = await res.json();

        console.log("AI RESPONSE:", data);

        if (data.error) {
          console.error("AI error:", data);
          continue;
        }

        // 🔍 Duplicate check
        const { data: existing } = await supabase
          .from("upgrades")
          .select("id")
          .eq("title", data.title)
          .maybeSingle();

        if (existing) {
          console.log("Duplicate skipped:", data.title);
          continue;
        }

        // 💾 Insert
        const { error } = await supabase.from("upgrades").insert([
          {
            title: data.title,
            summary: data.summary,
            category: data.category,
            what_changed: data.what_changed,
            why_it_changed: data.why_it_changed,
            user_impact: data.user_impact,
            developer_impact: data.developer_impact,
            significance_reason: data.significance_reason,
            impact_level: data.impact_level
          }
        ]);

        if (error) {
          console.error("Insert error:", error);
          continue;
        }

        console.log("Inserted:", data.title);
        insertedCount++;
      } catch (err) {
        console.error("Loop error:", err);
        continue;
      }
    }

    return Response.json({
      success: true,
      inserted: insertedCount
    });

  } catch (err: any) {
    console.error("Fetch route error:", err);

    return Response.json({
      error: "Fetch failed",
      message: err.message
    });
  }
}