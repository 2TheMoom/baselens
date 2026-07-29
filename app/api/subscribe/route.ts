import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";
import { sendConfirmationEmail } from "../../../lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const origin = new URL(req.url).origin;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("digest_subscribers")
      .select("confirm_token, confirmed")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing?.confirmed) {
      return NextResponse.json({ message: "You're already subscribed." });
    }

    let confirmToken = existing?.confirm_token;

    if (!confirmToken) {
      const { data: inserted, error } = await supabase
        .from("digest_subscribers")
        .insert([{ email: normalizedEmail }])
        .select("confirm_token")
        .single();

      if (error || !inserted) {
        console.error("Subscribe insert error:", error);
        return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
      }

      confirmToken = inserted.confirm_token;
    }

    const confirmUrl = `${origin}/api/subscribe/confirm?token=${confirmToken}`;
    await sendConfirmationEmail(normalizedEmail, confirmUrl);

    return NextResponse.json({ message: "Check your email to confirm your subscription." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
