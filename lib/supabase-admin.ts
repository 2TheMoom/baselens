import { createClient } from "@supabase/supabase-js";

// Server-only: uses the service role key, which bypasses RLS entirely.
// Never import this from a "use client" file or expose the key to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
