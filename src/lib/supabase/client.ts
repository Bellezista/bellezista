import { createBrowserClient } from "@supabase/ssr";

// For Client Components -- auth/storage only, same rule as the server client
// (see src/lib/supabase/server.ts).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
