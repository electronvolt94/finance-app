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
    rows = await query(
      "SELECT * FROM transactions WHERE user_id=$1 AND date LIKE $2 ORDER BY date DESC, id DESC",
      [session.userId, `${year}-${month.padStart(2,"0")}%`]
    );
  } else {
    rows = await query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC, id DESC LIMIT 100",
      [session.userId]
    );
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await query(
    "INSERT INTO transactions (user_id, date, amount, category, subcategory, description, is_one_off) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [session.userId, body.date, body.amount, body.category, body.subcategory || "", body.description, body.is_one_off ? 1 : 0]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await query("DELETE FROM transactions WHERE id=$1 AND user_id=$2", [id, session.userId]);
  return NextResponse.json({ ok: true });
}
