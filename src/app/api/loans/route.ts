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
  const body = await req.json();
  const { id } = body;
  const allowedFields = ["current_capital", "is_active", "original_capital", "monthly_payment", "interest_rate", "name", "owner", "start_date", "expected_end"];
  const updates = allowedFields.filter(f => body[f] !== undefined);
  if (updates.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  const setClause = updates.map((f, i) => `${f}=$${i + 1}`).join(", ");
  const values = updates.map(f => f === "is_active" ? (body[f] ? 1 : 0) : body[f]);
  await query(`UPDATE loans SET ${setClause}, updated_at=NOW() WHERE id=$${updates.length + 1}`, [...values, id]);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, owner, original_capital, monthly_payment, interest_rate, start_date, expected_end } = await req.json();
  const rows = await query(
    `INSERT INTO loans (name, owner, original_capital, current_capital, monthly_payment, interest_rate, start_date, expected_end)
     VALUES ($1,$2,$3,$3,$4,$5,$6,$7) RETURNING *`,
    [name, owner, Number(original_capital), Number(monthly_payment), Number(interest_rate), start_date, expected_end || null]
  );
  return NextResponse.json(rows[0]);
}
