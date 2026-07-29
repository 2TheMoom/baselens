import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/feed?subscribe=invalid`);
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("digest_subscribers")
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("confirm_token", token)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(`${origin}/feed?subscribe=invalid`);
  }

  return NextResponse.redirect(`${origin}/feed?subscribe=confirmed`);
}
