export async function GET() {
  return Response.json({
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL,
    app: process.env.NEXT_PUBLIC_APP_URL
  });
}