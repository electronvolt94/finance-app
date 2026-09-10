import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT * FROM goals ORDER BY id");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, target_amount, current_amount, target_date, category, notes } = await req.json();
  const rows = await query(
    `INSERT INTO goals (name, target_amount, current_amount, target_date, category, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, Number(target_amount) || 0, Number(current_amount) || 0, target_date || null, category || "savings", notes || ""]
  );
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = body;
  const allowedFields = ["name", "target_amount", "current_amount", "target_date", "category", "notes"];
  const updates = allowedFields.filter(f => body[f] !== undefined);
  if (updates.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  const setClause = updates.map((f, i) => `${f}=$${i + 1}`).join(", ");
  const values = updates.map(f => body[f]);
  await query(`UPDATE goals SET ${setClause}, updated_at=NOW() WHERE id=$${updates.length + 1}`, [...values, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await query("DELETE FROM goals WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}
