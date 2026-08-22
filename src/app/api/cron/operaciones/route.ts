import { NextResponse } from "next/server";
import { autoLiberarOperacionesVencidas } from "@/lib/operacion/otorgar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily auto-release of held payments whose review window has passed without an
// incidencia. Invoked by Vercel Cron (see vercel.json), which sends
// `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const res = await autoLiberarOperacionesVencidas();
  return NextResponse.json({ ok: true, ...res });
}
