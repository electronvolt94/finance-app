import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  let rows;
  if (year && month) {
    rows = await query("SELECT * FROM investments WHERE user_id=$1 AND year=$2 AND month=$3", [session.userId, year, month]);
  } else {
    rows = await query("SELECT * FROM investments WHERE user_id=$1 ORDER BY year DESC, month DESC LIMIT 24", [session.userId]);
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const fields = ["pea_balance","pea_contributed","av_balance","av_contributed","per_balance","pee_balance","livret_a_balance","ldds_balance","notes"];
  await query(`
    INSERT INTO investments (user_id, year, month, ${fields.join(",")})
    VALUES ($1, $2, $3, ${fields.map((_,i) => `$${i+4}`).join(",")})
    ON CONFLICT (user_id, year, month) DO UPDATE SET ${fields.map((f,i) => `${f}=$${i+4}`).join(",")}
  `, [session.userId, body.year, body.month, ...fields.map(f => body[f] ?? 0)]);
  return NextResponse.json({ ok: true });
}
