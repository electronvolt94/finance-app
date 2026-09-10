import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT * FROM loans ORDER BY is_active DESC, owner");
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, current_capital, is_active } = await req.json();
  await query("UPDATE loans SET current_capital=$1, is_active=$2, updated_at=NOW() WHERE id=$3", [current_capital, is_active ? 1 : 0, id]);
  return NextResponse.json({ ok: true });
}
