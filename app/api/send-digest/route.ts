import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { sendDigestEmail } from "../../../lib/email";

export async function GET(req: Request) {
  try {
    const { origin } = new URL(req.url);
    const supabase = createAdminClient();

    const { data: upgrades, error: upgradesError } = await supabase
      .from("public_upgrades")
      .select("id, title, category, impact_level, summary, source_url")
      .is("notified_at", null)
      .order("created_at", { ascending: true });

    if (upgradesError) {
      console.error("send-digest: failed to load upgrades", upgradesError);
      return NextResponse.json({ error: "Failed to load upgrades" }, { status: 500 });
    }

    if (!upgrades || upgrades.length === 0) {
      return NextResponse.json({ message: "No new upgrades — digest skipped." });
    }

    const { data: subscribers, error: subsError } = await supabase
      .from("digest_subscribers")
      .select("email, unsubscribe_token")
      .eq("confirmed", true);

    if (subsError) {
      console.error("send-digest: failed to load subscribers", subsError);
      return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
    }

    const feedUrl = `${origin}/feed`;
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers || []) {
      try {
        const unsubscribeUrl = `${origin}/api/unsubscribe?token=${sub.unsubscribe_token}`;
        await sendDigestEmail(sub.email, upgrades, feedUrl, unsubscribeUrl);
        sent++;
      } catch (err) {
        console.error(`send-digest: failed to email ${sub.email}`, err);
        failed++;
      }
    }

    const { error: markError } = await supabase
      .from("public_upgrades")
      .update({ notified_at: new Date().toISOString() })
      .in("id", upgrades.map((u) => u.id));

    if (markError) {
      console.error("send-digest: failed to mark upgrades notified", markError);
    }

    return NextResponse.json({
      message: `Digest sent: ${upgrades.length} upgrade(s) to ${sent} subscriber(s)${failed ? `, ${failed} failed` : ""}.`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-digest error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
