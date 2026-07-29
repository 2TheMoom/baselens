import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/feed?subscribe=invalid`);
  }

  const supabase = createAdminClient();

  await supabase
    .from("digest_subscribers")
    .delete()
    .eq("unsubscribe_token", token);

  return NextResponse.redirect(`${origin}/feed?subscribe=unsubscribed`);
}
