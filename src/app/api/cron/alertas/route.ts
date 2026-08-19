import { NextResponse } from "next/server";
import { procesarAlertasSemanales } from "@/lib/alertas/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Weekly digest of saved-search alerts. Invoked by Vercel Cron (see vercel.json),
// which sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const res = await procesarAlertasSemanales();
  return NextResponse.json({ ok: true, ...res });
}
