import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// For Server Components, Server Actions, and Route Handlers -- auth/storage
// only (see plan's security section: app data always goes through Prisma,
// never through this client's `.from()` query builder). A new client is
// created per request, never shared/cached across requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components can't write cookies -- this throws when called
          // from one, which is fine as long as proxy.ts is refreshing the
          // session on every request (see proxy.ts). Server Actions and Route
          // Handlers CAN write cookies, so this succeeds there.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component -- ignore, proxy.ts covers it.
          }
        },
      },
    },
  );
}
