import { NextResponse } from "next/server";
import { caducarOfertasVencidas } from "@/lib/oferta/otorgar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily job that marks expired offers CADUCADA. The landing already hides them
// at render time; this keeps the stored state consistent. Invoked by Vercel
// Cron (see vercel.json) with `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const res = await caducarOfertasVencidas();
  return NextResponse.json({ ok: true, ...res });
}
