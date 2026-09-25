import { NextResponse } from "next/server";

/**
 * Liveness probe. Deliberately has NO database dependency so it answers
 * even before migrations have run or when the DB is unreachable.
 */
export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
