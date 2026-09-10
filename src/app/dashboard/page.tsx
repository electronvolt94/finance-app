import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { query, queryOne } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loans = await query("SELECT * FROM loans ORDER BY is_active DESC");
  const goals = await query("SELECT * FROM goals");
  const recentExpenses = await query(
    "SELECT * FROM monthly_entries WHERE user_id=$1 ORDER BY year DESC, month DESC LIMIT 6",
    [session.userId]
  );
  const recentInvestments = await queryOne(
    "SELECT * FROM investments WHERE user_id=$1 ORDER BY year DESC, month DESC LIMIT 1",
    [session.userId]
  );

  return (
    <DashboardClient
      user={{ userId: session.userId, name: session.name }}
      loans={loans}
      goals={goals}
      recentExpenses={recentExpenses}
      const intercalaryTotal = await queryOne( "SELECT COALESCE(SUM(mortgage_interest),0) as total FROM monthly_entries WHERE user_id=$1", [session.userId] )
      latestInvestments={recentInvestments}
      currentYear={year}
      currentMonth={month}
      totalIntercalaryInterest={Number(intercalaryTotal?.total || 0)}
    />
  );
}
