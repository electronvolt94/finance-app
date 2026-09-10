"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const C = {
  bg: "#03050e", panel: "#070b17", panel2: "#0b1020", border: "#0f1829",
  green: "#10d9a0", gold: "#f0b429", blue: "#4f9ef8", purple: "#b794f6",
  orange: "#fb923c", red: "#f87171", text: "#e2e8f0", muted: "#334155", sub: "#64748b",
};

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

const pct = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Tag({ label, col }: { label: string; col: string }) {
  return (
    <span style={{ background: col+"22", color: col, border: `1px solid ${col}55`, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const }}>
      {label}
    </span>
  );
}

function KpiCard({ label, value, target, col, sub, prefix = "" }: any) {
  const progress = target ? pct(value, target) : null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${col}22`, borderRadius: 10, padding: "14px 16px" }}>
      <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 1, margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: col, fontWeight: 900, fontSize: 18, margin: "0 0 3px" }}>{prefix}{eur(value)}</p>
      {sub && <p style={{ color: C.muted, fontSize: 10, margin: "0 0 6px" }}>{sub}</p>}
      {progress !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: C.muted, fontSize: 9 }}>Progress</span>
            <span style={{ color: col, fontSize: 9, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ background: C.border, borderRadius: 3, height: 5 }}>
            <div style={{ width: `${progress}%`, background: col, height: 5, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <p style={{ color: C.muted, fontSize: 9, margin: "3px 0 0" }}>Target: {eur(target)}</p>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, current, target, col }: any) {
  const p = pct(current, target);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ color: col, fontSize: 12, fontWeight: 700 }}>{eur(current)} / {eur(target)}</span>
      </div>
      <div style={{ background: C.border, borderRadius: 4, height: 8 }}>
        <div style={{ width: `${p}%`, background: col, height: 8, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <p style={{ color: C.muted, fontSize: 10, margin: "3px 0 0" }}>{p}% complete</p>
    </div>
  );
}

const TABS = [
  { id: "kpi",        label: "📊 KPIs" },
  { id: "track",      label: "✏️ Track Month" },
  { id: "investments",label: "📈 Investments" },
  { id: "loans",      label: "💳 Loans" },
  { id: "goals",      label: "🎯 Goals" },
  { id: "history",    label: "📅 History" },
];
function simulateLoan(principal: number, annualRatePct: number, monthlyPayment: number) { const r = annualRatePct / 100 / 12;
let balance = principal; 
                                                                                         let months = 0; 
                                                                                         let interestPaid = 0;
                                                                                         while (balance > 0.01 && months < 1000)
                                                                                         { const interest = balance * r;interestPaid += interest;
                                         let principalPortion = monthlyPayment - interest; 
                                         if (principalPortion <= 0) { months = Infinity; break; } 
                                         if (principalPortion > balance) principalPortion = balance; balance -= principalPortion; months++; } 
                                                                                         return { months, interestPaid }; }
                                         
export default function DashboardClient({ user, loans, goals, recentExpenses, latestInvestments, currentYear, currentMonth, totalIntercalaryInterest }: any) {
  const router = useRouter();
  const [tab, setTab] = useState("kpi");

  // expense form state
  const [expYear, setExpYear] = useState(currentYear);
  const [expMonth, setExpMonth] = useState(currentMonth);
  const [expForm, setExpForm] = useState<Record<string, string>>({});
  const [expSaving, setExpSaving] = useState(false);
  const [expSaved, setExpSaved] = useState(false);

  // investment form state
  const [invYear, setInvYear] = useState(currentYear);
  const [invMonth, setInvMonth] = useState(currentMonth);
  const [invForm, setInvForm] = useState<Record<string, string>>({});
  const [invSaving, setInvSaving] = useState(false);
  const [invSaved, setInvSaved] = useState(false);

  // loans local state
  const [loanData, setLoanData] = useState<any[]>(loans);
  const [calcLoanId, setCalcLoanId] = useState<number | null>(null);
  const [extraPayment, setExtraPayment] = useState("");

  // Load existing expense entry
  useEffect(() => {
    fetch(`/api/expenses?year=${expYear}&month=${expMonth}`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const d = data[0];
          setExpForm({
            income: d.income, tgv: d.tgv, address_maintenance: d.address_maintenance,
            loan_524: d.loan_524, loan_93: d.loan_93, loan_500: d.loan_500,
            phone_loan: d.phone_loan, phone_connection: d.phone_connection,
            navigo: d.navigo, tcl: d.tcl, india_transfer: d.india_transfer,
            gym: d.gym, amex: d.amex, rent: d.rent, electricity: d.electricity,
            water: d.water, wifi: d.wifi, groceries: d.groceries,mortgage_interest: d.mortgage_interest,
            youtube: d.youtube, personal: d.personal, other: d.other, notes: d.notes || "",
          });
        } else {
          setExpForm({});
        }
      });
  }, [expYear, expMonth]);

  // Load existing investment entry
  useEffect(() => {
    fetch(`/api/investments?year=${invYear}&month=${invMonth}`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const d = data[0];
          setInvForm({
            pea_balance: d.pea_balance, pea_contributed: d.pea_contributed,
            av_balance: d.av_balance, av_contributed: d.av_contributed,
            per_balance: d.per_balance, pee_balance: d.pee_balance,
            livret_a_balance: d.livret_a_balance, ldds_balance: d.ldds_balance,
            notes: d.notes || "",
          });
        } else setInvForm({});
      });
  }, [invYear, invMonth]);

  async function saveExpenses() {
    setExpSaving(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: expYear, month: expMonth, ...expForm }),
    });
    setExpSaving(false);
    setExpSaved(true);
    setTimeout(() => { setExpSaved(false); router.refresh(); }, 1500);
  }

  async function saveInvestments() {
    setInvSaving(true);
    await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: invYear, month: invMonth, ...invForm }),
    });
    setInvSaving(false);
    setInvSaved(true);
    setTimeout(() => { setInvSaved(false); router.refresh(); }, 1500);
  }

  async function updateLoan(id: number, current_capital: number, is_active: boolean) {
    await fetch("/api/loans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, current_capital, is_active }),
    });
    setLoanData(prev => prev.map(l => l.id === id ? { ...l, current_capital, is_active: is_active ? 1 : 0 } : l));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Computed KPIs
  const totalLoanCapital = loanData.filter(l => l.is_active && !l.name.toLowerCase().includes("mortgage")).reduce((s: number, l: any) => s + l.current_capital, 0);
  const latest = recentExpenses[0];
  const totalExpenses = latest ? Object.entries(latest).filter(([k]) => !["id","user_id","year","month","income","notes","created_at"].includes(k)).reduce((s, [,v]) => s + (Number(v) || 0), 0) : 0;
  const surplus = latest ? (latest.income || 0) - totalExpenses : 0;
  const totalInvested = latestInvestments
    ? (latestInvestments.pea_balance || 0) + (latestInvestments.av_balance || 0) + (latestInvestments.per_balance || 0) + (latestInvestments.pee_balance || 0) + (latestInvestments.livret_a_balance || 0)
    : 0;
  
  // chart data from history
  const chartData = recentExpenses.slice().reverse().map((e: any) => ({
    name: `${MONTHS[e.month - 1]} ${e.year}`,
    income: e.income || 0,
    expenses: Object.entries(e).filter(([k]) => !["id","user_id","year","month","income","notes","created_at"].includes(k)).reduce((s, [,v]) => s + (Number(v) || 0), 0),
    surplus: (e.income || 0) - Object.entries(e).filter(([k]) => !["id","user_id","year","month","income","notes","created_at"].includes(k)).reduce((s, [,v]) => s + (Number(v) || 0), 0),
  }));

  const EF = (key: string, label: string, placeholder?: string) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={key === "notes" ? "text" : "number"}
        value={expForm[key] || ""}
        onChange={e => setExpForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder || "0"}
        step="0.01"
      />
    </div>
  );

  const IF = (key: string, label: string) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        value={invForm[key] || ""}
        onChange={e => setInvForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder="0"
        step="0.01"
      />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'IBM Plex Mono', monospace", color: C.text, paddingBottom: 60 }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg,#050e1f,#06111e 60%,#04090f)", borderBottom: "1px solid #1e3a5f", padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 2px" }}>💰 Finance Tracker</h1>
            <p style={{ color: C.sub, fontSize: 11, margin: 0 }}>Welcome, {user.name} · Sajeev & Shikha Plan</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/track" style={{ background: C.green, color: "#000", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
              ➕ Daily Log
            </Link>
            <button onClick={logout} style={{ background: C.muted, color: C.text, border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 600 }}>
              Log out
            </button>
          </div>
        </div>

        {/* QUICK KPI BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "Total Loans Left", val: eur(totalLoanCapital), col: totalLoanCapital > 0 ? C.red : C.green },
            { label: "This Month Surplus", val: surplus >= 0 ? eur(surplus) : `-${eur(Math.abs(surplus))}`, col: surplus >= 0 ? C.green : C.red },
            { label: "Total Invested", val: eur(totalInvested), col: C.blue }, 
          ].map(({ label, val, col }) => (
            <div key={label} style={{ background: C.panel, border: `1px solid ${col}22`, borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, margin: "0 0 3px" }}>{label}</p>
              <p style={{ color: col, fontWeight: 900, fontSize: 14, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.panel, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent",
            color: tab === t.id ? C.green : C.muted,
            padding: "11px 14px", cursor: "pointer", fontFamily: "inherit",
            fontSize: 11, fontWeight: tab === t.id ? 700 : 400, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 18px 0" }}>

        {/* ── KPI TAB ── */}
        {tab === "kpi" && (
          <div>
            {/* GOAL PROGRESS */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 16 }}>🎯 Goal Progress</h3>
              <ProgressBar label="Loans Cleared" current={16930 - totalLoanCapital} target={16930} col={C.red} />
              <ProgressBar label="Emergency Fund (target €21k)" current={latestInvestments?.livret_a_balance || 4000} target={21000} col={C.blue} />
              <ProgressBar label="PEA Combined (target €150k each)" current={latestInvestments?.pea_balance || 1522} target={150000} col={C.green} />
              <ProgressBar label="Total Invested" current={totalInvested || (1522 + 3300 + 4000)} target={50000} col={C.purple} />
            </div>

            {/* LOAN COUNTDOWN */}
            <div style={{ background: C.panel, border: `1px solid ${C.red}33`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.red, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>💀 Kamikaze Loan Countdown</h3>
              {loanData.filter((l: any) => l.is_active).map((loan: any) => {
                const progress = pct(loan.original_capital - loan.current_capital, loan.original_capital);
                const colr = loan.owner === "Sajeev" ? C.orange : C.blue;
                return (
                  <div key={loan.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{loan.name}</span>
                        <Tag label={loan.owner} col={colr} />
                      </div>
                      <span style={{ color: colr, fontWeight: 800, fontSize: 14 }}>{eur(loan.current_capital)}</span>
                    </div>
                    <div style={{ background: C.border, borderRadius: 4, height: 8, marginBottom: 4 }}>
                      <div style={{ width: `${progress}%`, background: colr, height: 8, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.muted, fontSize: 10 }}>{progress}% paid off</span>
                      <span style={{ color: C.muted, fontSize: 10 }}>Target: {loan.expected_end?.slice(0,7)}</span>
                    </div>
                  </div>
                );
              })}
              {loanData.filter((l: any) => !l.is_active).length > 0 && (
                <p style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>
                  ✅ {loanData.filter((l: any) => !l.is_active).length} loan(s) fully cleared!
                </p>
              )}
            </div>

            {/* SURPLUS CHART */}
            {chartData.length > 0 && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📊 Monthly Surplus History</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} />
                    <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11 }} formatter={(v: any) => eur(v)} />
                    <Area type="monotone" dataKey="surplus" stroke={C.green} fill="url(#sg)" strokeWidth={2} name="Surplus" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* KPI CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <KpiCard label="Monthly Surplus" value={surplus} target={988} col={surplus >= 988 ? C.green : C.orange} sub="Target: €988/mo (kamikaze)" />
              <KpiCard label="Total Loan Capital" value={totalLoanCapital} col={C.red} sub="Target: €0 by Mar 2027" />
              <KpiCard label="Investments Total" value={totalInvested || (1522+3300+4000)} col={C.blue} sub="PEA + AV + PER + PEE + Livret" />
              <KpiCard label="Intercalary Interest Paid" value={totalIntercalaryInterest} col={C.orange} sub="Mortgage interest-only phase" />
            </div>

            {/* DELIVERY COUNTDOWN */}
            <div style={{ background: "linear-gradient(135deg,#060e1a,#06130e)", border: `1px solid ${C.green}33`, borderRadius: 12, padding: 18 }}>
              <h3 style={{ color: C.green, fontWeight: 800, fontSize: 13, marginBottom: 12 }}>🏠 Clamart Delivery Countdown</h3>
              {(() => {
                const delivery = new Date("2028-06-01");
                const now = new Date();
                const months = (delivery.getFullYear() - now.getFullYear()) * 12 + delivery.getMonth() - now.getMonth();
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Months to delivery", val: `${months}`, col: C.green },
                      { label: "Post-delivery free cash", val: "€3,500/mo", col: C.gold },
                      { label: "Investable (real life)", val: "€2,066/mo", col: C.blue },
                    ].map(({ label, val, col }) => (
                      <div key={label} style={{ background: C.panel2, border: `1px solid ${col}22`, borderRadius: 8, padding: "10px 12px" }}>
                        <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, margin: "0 0 4px" }}>{label}</p>
                        <p style={{ color: col, fontWeight: 900, fontSize: 15, margin: 0 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── TRACK MONTH ── */}
        {tab === "track" && (
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>✏️ Enter Monthly Expenses</h3>

              {/* Month/Year selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Year</label>
                  <select value={expYear} onChange={e => setExpYear(Number(e.target.value))}>
                    {[2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Month</label>
                  <select value={expMonth} onChange={e => setExpMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Income */}
              <div style={{ background: C.green+"10", border: `1px solid ${C.green}30`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ color: C.green, fontWeight: 700, fontSize: 12, margin: "0 0 10px" }}>💰 Income</p>
                {EF("income", "Net Income (your share)", "3600")}
              </div>

              {/* Sajeev expenses */}
              <div style={{ background: C.blue+"08", border: `1px solid ${C.blue}22`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ color: C.blue, fontWeight: 700, fontSize: 12, margin: "0 0 10px" }}>👤 Sajeev Expenses</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {EF("tgv","TGV","670")}
                  {EF("address_maintenance","Asnières Address","240")}
                  {EF("loan_524","Loan €524","524")}
                  {EF("loan_93","Loan €93","93")}
                  {EF("phone_loan","Phone Loan","110")}
                  {EF("phone_connection","Phone Connection","15")}
                  {EF("navigo","Navigo","94")}
                  {EF("tcl","TCL","74")}
                  {EF("india_transfer","India Transfer","150")}
                  {EF("gym","Gym","30")}
                  {EF("amex","AMEX","50")}
                  {EF("personal","Personal","200")}
                </div>
              </div>

              {/* Shikha expenses */}
              <div style={{ background: C.purple+"08", border: `1px solid ${C.purple}22`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ color: C.purple, fontWeight: 700, fontSize: 12, margin: "0 0 10px" }}>👤 Shikha Expenses</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {EF("rent","Rent Lyon","1110")}
                  {EF("electricity","Electricity","230")}
                  {EF("water","Water","15")}
                  {EF("wifi","WiFi/Phone","40")}
                  {EF("loan_500","Loan €500","500")}
                  {EF("groceries","Groceries","200")}
                  {EF("youtube","YouTube Music","20")}
                </div>
              </div>

              {/* Other */}
              <div style={{ marginBottom: 16 }}>
                {EF("other","Other / One-off","0")}
                {EF("mortgage_interest", "Mortgage Interest (Intercalary)")}
                {EF("notes","Notes","")}
              </div>

              {/* Live calculation */}
              {Object.keys(expForm).length > 0 && (
                <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                  {(() => {
                    const totalExp = ["tgv","address_maintenance","loan_524","loan_93","loan_500","phone_loan","phone_connection","navigo","tcl","india_transfer","gym","amex","rent","electricity","water","wifi","groceries","youtube","personal","other"].reduce((s, k) => s + (Number(expForm[k]) || 0), 0);
                    const inc = Number(expForm.income) || 0;
                    const surp = inc - totalExp;
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: C.sub, fontSize: 12 }}>Total expenses</span>
                          <span style={{ color: C.red, fontWeight: 700 }}>{eur(totalExp)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>Monthly surplus</span>
                          <span style={{ color: surp >= 0 ? C.green : C.red, fontWeight: 900, fontSize: 15 }}>{eur(surp)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button onClick={saveExpenses} disabled={expSaving} style={{
                width: "100%", background: expSaved ? C.green : C.blue, color: expSaved ? "#000" : "#fff",
                border: "none", borderRadius: 8, padding: "13px 0", fontWeight: 800, fontSize: 14,
              }}>
                {expSaved ? "✅ Saved!" : expSaving ? "Saving..." : `Save ${MONTHS[expMonth-1]} ${expYear}`}
              </button>
            </div>
          </div>
        )}

        {/* ── INVESTMENTS ── */}
        {tab === "investments" && (
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.green}22`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.green, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📈 Update Investment Balances</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Year</label>
                  <select value={invYear} onChange={e => setInvYear(Number(e.target.value))}>
                    {[2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Month</label>
                  <select value={invMonth} onChange={e => setInvMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {IF("pea_balance","PEA Balance (total both)")}
                {IF("pea_contributed","PEA Contributed this month")}
                {IF("av_balance","Assurance-Vie Balance")}
                {IF("av_contributed","AV Contributed this month")}
                {IF("per_balance","PER Balance")}
                {IF("pee_balance","PEE Balance (total both)")}
                {IF("livret_a_balance","Livret A Balance")}
                {IF("ldds_balance","LDDS Balance")}
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Notes</label>
                <input value={invForm.notes || ""} onChange={e => setInvForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Bought CW8, PEE allocation done..." />
              </div>

              {/* Live totals */}
              {Object.keys(invForm).length > 0 && (
                <div style={{ background: C.panel2, borderRadius: 8, padding: "12px 14px", marginTop: 14 }}>
                  {[
                    { label: "PEA", val: Number(invForm.pea_balance) || 0, col: C.green },
                    { label: "Assurance-Vie", val: Number(invForm.av_balance) || 0, col: C.blue },
                    { label: "PER", val: Number(invForm.per_balance) || 0, col: C.purple },
                    { label: "PEE", val: Number(invForm.pee_balance) || 0, col: C.orange },
                    { label: "Livret A + LDDS", val: (Number(invForm.livret_a_balance) || 0) + (Number(invForm.ldds_balance) || 0), col: C.gold },
                  ].map(({ label, val, col }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: C.sub, fontSize: 12 }}>{label}</span>
                      <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>{eur(val)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0" }}>
                    <span style={{ color: C.text, fontWeight: 800 }}>Total</span>
                    <span style={{ color: C.green, fontWeight: 900, fontSize: 15 }}>
                      {eur(["pea_balance","av_balance","per_balance","pee_balance","livret_a_balance","ldds_balance"].reduce((s, k) => s + (Number(invForm[k]) || 0), 0))}
                    </span>
                  </div>
                </div>
              )}

              <button onClick={saveInvestments} disabled={invSaving} style={{
                width: "100%", background: invSaved ? C.green : C.purple, color: invSaved ? "#000" : "#fff",
                border: "none", borderRadius: 8, padding: "13px 0", fontWeight: 800, fontSize: 14, marginTop: 14,
              }}>
                {invSaved ? "✅ Saved!" : invSaving ? "Saving..." : `Save ${MONTHS[invMonth-1]} ${invYear}`}
              </button>
            </div>
          </div>
        )}

        {/* ── LOANS ── */}
        {tab === "loans" && (
          <div>
            <p style={{ color: C.sub, fontSize: 12, marginBottom: 14 }}>Update loan capital remaining each month as you make extra payments.</p>
            {loanData.map((loan: any) => (
              <div key={loan.id} style={{ background: C.panel, border: `1px solid ${loan.is_active ? C.orange : C.green}33`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>{loan.name}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Tag label={loan.owner} col={loan.owner === "Sajeev" ? C.blue : C.purple} />
                      <Tag label={loan.is_active ? "ACTIVE" : "CLEARED ✅"} col={loan.is_active ? C.orange : C.green} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: C.orange, fontWeight: 900, fontSize: 16, margin: 0 }}>{eur(loan.current_capital)}</p>
                    <p style={{ color: C.muted, fontSize: 10 }}>of {eur(loan.original_capital)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ background: C.border, borderRadius: 4, height: 8, marginBottom: 8 }}>
                  <div style={{ width: `${pct(loan.original_capital - loan.current_capital, loan.original_capital)}%`, background: loan.is_active ? C.orange : C.green, height: 8, borderRadius: 4 }} />
                </div>

                {/* Update form */}
                {loan.is_active && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      type="number"
                      defaultValue={loan.current_capital}
                      id={`loan-${loan.id}`}
                      style={{ flex: 1 }}
                      placeholder="New capital remaining"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`loan-${loan.id}`) as HTMLInputElement;
                        const val = Number(el.value);
                        updateLoan(loan.id, val, val > 0);
                      }}
                      style={{ background: C.green, color: "#000", border: "none", borderRadius: 6, padding: "8px 14px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                      Update
                    </button>
                    <button
                      onClick={() => updateLoan(loan.id, 0, false)}
                      style={{ background: C.red + "22", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "8px 10px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                      💀 Cleared
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loanData.filter((l: any) => l.is_active).length > 0 && (
              <div style={{ background: C.panel, border: `1px solid ${C.green}33`, borderRadius: 12, padding: 18, marginTop: 4 }}>
                <h3 style={{ color: C.green, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>💡 Payoff Calculator</h3>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Which loan?</label>
                  <select value={calcLoanId ?? ""} onChange={e => setCalcLoanId(Number(e.target.value))} style={{ width: "100%" }}>
                    <option value="" disabled>Select a loan</option>
                    {loanData.filter((l: any) => l.is_active).map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>Extra payment per month (€)</label>
                  <input type="number" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} placeholder="e.g. 100" />
                </div>
                {calcLoanId && extraPayment && Number(extraPayment) > 0 && (() => {
                  const loan = loanData.find((l: any) => l.id === calcLoanId);
                  if (!loan) return null;
                  const base = simulateLoan(loan.current_capital, loan.interest_rate, loan.monthly_payment);
                  const withExtra = simulateLoan(loan.current_capital, loan.interest_rate, loan.monthly_payment + Number(extraPayment));
                  const monthsSaved = base.months - withExtra.months;
                  const interestSaved = base.interestPaid - withExtra.interestPaid;
                  return (
                    <div style={{ background: C.panel2, borderRadius: 8, padding: 14 }}>
                      <p style={{ color: C.text, fontSize: 13, margin: "0 0 8px" }}>
                        Paying an extra <b style={{ color: C.green }}>{eur(Number(extraPayment))}</b>/month on <b>{loan.name}</b> would:
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: C.panel, borderRadius: 8, padding: "10px 12px" }}>
                          <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, margin: "0 0 3px" }}>Months saved</p>
                          <p style={{ color: C.green, fontWeight: 900, fontSize: 16, margin: 0 }}>{isFinite(monthsSaved) ? monthsSaved : "—"}</p>
                        </div>
                        <div style={{ background: C.panel, borderRadius: 8, padding: "10px 12px" }}>
                          <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, margin: "0 0 3px" }}>Interest saved</p>
                          <p style={{ color: C.gold, fontWeight: 900, fontSize: 16, margin: 0 }}>{isFinite(interestSaved) ? eur(interestSaved) : "—"}</p>
                        </div>
                      </div>
                      <p style={{ color: C.muted, fontSize: 10, marginTop: 8 }}>
                        New payoff time: {isFinite(withExtra.months) ? `${Math.floor(withExtra.months/12)}y ${withExtra.months%12}mo` : "N/A"} (vs {isFinite(base.months) ? `${Math.floor(base.months/12)}y ${base.months%12}mo` : "N/A"} currently)
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── GOALS ── */}
        {tab === "goals" && (
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 16 }}>🎯 Financial Goals</h3>
              {goals.map((g: any) => {
                const catColor: Record<string,string> = { apport: C.gold, savings: C.blue, investment: C.green, mortgage: C.red, lifestyle: C.orange, family: C.purple };
                const col = catColor[g.category] || C.sub;
                return (
                  <div key={g.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 3px" }}>{g.name}</p>
                        <Tag label={g.category} col={col} />
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: col, fontWeight: 800, fontSize: 14, margin: "0 0 2px" }}>{eur(g.current_amount)}</p>
                        <p style={{ color: C.muted, fontSize: 10 }}>of {eur(g.target_amount)}</p>
                      </div>
                    </div>
                    <div style={{ background: C.border, borderRadius: 4, height: 8, marginBottom: 4 }}>
                      <div style={{ width: `${pct(g.current_amount, g.target_amount)}%`, background: col, height: 8, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.muted, fontSize: 10 }}>{pct(g.current_amount, g.target_amount)}%</span>
                      {g.target_date && <span style={{ color: C.muted, fontSize: 10 }}>Target: {g.target_date.slice(0,7)}</span>}
                    </div>
                    {g.notes && <p style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{g.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📅 Expense History</h3>
              {recentExpenses.length === 0 && (
                <p style={{ color: C.sub, fontSize: 12 }}>No entries yet. Start tracking in the Track Month tab!</p>
              )}
              {recentExpenses.map((e: any) => {
                const totalExp = ["tgv","address_maintenance","loan_524","loan_93","loan_500","phone_loan","phone_connection","navigo","tcl","india_transfer","gym","amex","rent","electricity","water","wifi","groceries","youtube","personal","other"].reduce((s, k) => s + (Number(e[k]) || 0), 0);
                const surp = (e.income || 0) - totalExp;
                return (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{MONTHS[e.month-1]} {e.year}</p>
                      <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>Income: {eur(e.income)} · Expenses: {eur(totalExp)}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: surp >= 0 ? C.green : C.red, fontWeight: 800, fontSize: 14, margin: 0 }}>{eur(surp)}</p>
                      <p style={{ color: C.muted, fontSize: 10 }}>surplus</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {chartData.length > 1 && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} />
                    <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11 }} formatter={(v: any) => eur(v)} />
                    <Bar dataKey="income" fill={C.green} name="Income" radius={[4,4,0,0]} />
                    <Bar dataKey="expenses" fill={C.red} name="Expenses" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
