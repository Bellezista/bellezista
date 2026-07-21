import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same file/matcher
// conventions otherwise -- see the plan's Next.js 16 addendum). This refreshes
// the Supabase session cookie on every request and redirects anonymous users
// away from authenticated-only routes. It deliberately does NOT do the
// admin-role check -- that's a real Prisma lookup, which belongs close to the
// data (in the /admin layout), not as a JWT-claim guess here.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Refreshes the auth cookie if the access token is expired. Must run on
  // every matched request -- do not remove or short-circuit this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /catalogo and /anuncios/[id] are deliberately public -- browsing and
  // viewing a listing doesn't require an account (FichaContactoCard renders
  // a "log in to contact" prompt for guests; gating the page itself would
  // make that prompt unreachable and hurt shareability of listings).
  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/admin") ||
    ["/publicar", "/mis-anuncios", "/mensajes"].some((p) =>
      path.startsWith(p),
    );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
