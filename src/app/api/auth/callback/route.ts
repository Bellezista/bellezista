import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only Route Handler this app needs (see the plan's data-fetching strategy --
// Server Actions are the mutation path everywhere else). Handles the
// PKCE/email-confirmation redirect: Supabase Auth sends the user back here
// with a `code` param, which gets exchanged for a session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/catalogo";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
