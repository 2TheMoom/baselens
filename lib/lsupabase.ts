import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wqzcqnhtiujalriciydy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemNxbmh0aXVqYWxyaWNpeWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQwNTIzNywiZXhwIjoyMDkyOTgxMjM3fQ.Gog_BUC4lBzPF0exa1cvAnj39YKCcT03q0A_S2XcsW8";

export const supabase = createClient(supabaseUrl, supabaseKey);