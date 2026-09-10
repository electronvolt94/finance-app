import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const rows = await query("SELECT * FROM users WHERE username = $1", [username]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
  }
  await createSession(user.id, user.name);
  return NextResponse.json({ ok: true, name: user.name });
}
