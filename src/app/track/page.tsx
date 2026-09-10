"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const C = {
  bg: "#03050e", panel: "#070b17", panel2: "#0b1020", border: "#0f1829",
  green: "#10d9a0", gold: "#f0b429", blue: "#4f9ef8", purple: "#b794f6",
  orange: "#fb923c", red: "#f87171", text: "#e2e8f0", muted: "#334155", sub: "#64748b",
};

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

const CATEGORIES = [
  { id: "groceries",    label: "🛒 Groceries",         col: C.green,  budget: 200 },
  { id: "transport",    label: "🚇 Transport",          col: C.blue,   budget: 250 },
  { id: "food_out",     label: "🍽️ Eating Out",        col: C.orange, budget: 150 },
  { id: "india",        label: "🇮🇳 India Transfer",   col: C.purple, budget: 250 },
  { id: "subscriptions",label: "📱 Subscriptions",     col: C.gold,   budget: 100 },
  { id: "health",       label: "💊 Health",             col: C.red,    budget: 50  },
  { id: "clothing",     label: "👕 Clothing",           col: C.blue,   budget: 50  },
  { id: "home",         label: "🏠 Home / Utilities",  col: C.green,  budget: 100 },
  { id: "entertainment",label: "🎬 Entertainment",     col: C.purple, budget: 50  },
  { id: "baby",         label: "👶 Baby",               col: C.pink || "#f9a8d4", budget: 200 },
  { id: "holiday",      label: "✈️ Holiday / Travel",  col: C.gold,   budget: 167 },
  { id: "personal",     label: "👤 Personal",           col: C.sub,    budget: 200 },
  { id: "one_off",      label: "⚡ One-Off",            col: C.red,    budget: 0   },
  { id: "other",        label: "📦 Other",              col: C.muted,  budget: 100 },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Tag({ label, col }: { label: string; col: string }) {
  return (
    <span style={{ background: col+"22", color: col, border: `1px solid ${col}44`, borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const }}>
      {label}
    </span>
  );
}

export default function DailyTracker() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [txns, setTxns]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [date, setDate]           = useState(now.toISOString().slice(0, 10));
  const [amount, setAmount]       = useState("");
  const [category, setCategory]   = useState("groceries");
  const [desc, setDesc]           = useState("");
  const [isOneOff, setIsOneOff]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [view, setView]           = useState<"add"|"month"|"cats">("add");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/transactions?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(data => { setTxns(Array.isArray(data) ? data : []); setLoading(false); });
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  async function addTxn(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !desc) return;
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, amount: parseFloat(amount), category: isOneOff ? "one_off" : category, description: desc, is_one_off: isOneOff }),
    });
    setAmount(""); setDesc(""); setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    load();
    setSaving(false);
  }

  async function deleteTxn(id: number) {
    await fetch("/api/transactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  // totals by category for the month
  const catTotals: Record<string, number> = {};
  txns.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const monthTotal = txns.reduce((s, t) => s + t.amount, 0);
  const oneOffTotal = txns.filter(t => t.is_one_off).reduce((s, t) => s + t.amount, 0);
  const regularTotal = monthTotal - oneOffTotal;

  // group by date for timeline view
  const byDate: Record<string, any[]> = {};
  txns.forEach(t => { if (!byDate[t.date]) byDate[t.date] = []; byDate[t.date].push(t); });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'IBM Plex Mono', monospace", color: C.text, paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg,#050e1f,#06111e)", borderBottom: "1px solid #1e3a5f", padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h1 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>📝 Daily Expense Tracker</h1>
          <Link href="/dashboard" style={{ color: C.sub, fontSize: 11, textDecoration: "none" }}>← Dashboard</Link>
        </div>
        <p style={{ color: C.sub, fontSize: 11, margin: "0 0 14px" }}>Log every expense — auto-cumulates monthly</p>

        {/* Month selector */}
        <div style={{ display: "flex", gap: 8 }}>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "6px 10px", fontFamily: "inherit", fontSize: 12, flex: 1 }}>
            {[2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "6px 10px", fontFamily: "inherit", fontSize: 12, flex: 2 }}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m} {year}</option>)}
          </select>
        </div>

        {/* Month summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {[
            { label: "Total Spent", val: monthTotal, col: C.red },
            { label: "Regular", val: regularTotal, col: C.orange },
            { label: "One-offs", val: oneOffTotal, col: C.purple },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ background: C.panel, border: `1px solid ${col}22`, borderRadius: 8, padding: "9px 11px" }}>
              <p style={{ color: C.muted, fontSize: 9, textTransform: "uppercase" as const, margin: "0 0 3px" }}>{label}</p>
              <p style={{ color: col, fontWeight: 900, fontSize: 14, margin: 0 }}>{eur(val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SUB TABS */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        {[
          { id: "add",   label: "➕ Add" },
          { id: "month", label: "📅 Timeline" },
          { id: "cats",  label: "📊 By Category" },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id as any)} style={{
            flex: 1, background: "none", border: "none",
            borderBottom: view === t.id ? `2px solid ${C.green}` : "2px solid transparent",
            color: view === t.id ? C.green : C.muted,
            padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: view === t.id ? 700 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "18px 16px 0" }}>

        {/* ── ADD EXPENSE ── */}
        {view === "add" && (
          <div>
            <form onSubmit={addTxn}>
              <div style={{ background: C.panel, border: `1px solid ${C.green}33`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <h3 style={{ color: C.green, fontWeight: 800, fontSize: 13, marginBottom: 16 }}>➕ Log an Expense</h3>

                {/* Date */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 13, width: "100%" }} />
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Amount (€)</label>
                  <input
                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" step="0.01" min="0" required
                    style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 18, fontWeight: 700, width: "100%" }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>What was it? (be specific)</label>
                  <input
                    type="text" value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="e.g. Lidl weekly shop, TGV Paris ticket, Dentist..."
                    required
                    style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 13, width: "100%" }}
                  />
                </div>

                {/* Category */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: C.sub, fontSize: 10, textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Category</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {CATEGORIES.filter(c => c.id !== "one_off").map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setCategory(cat.id); setIsOneOff(false); }}
                        style={{
                          background: category === cat.id && !isOneOff ? cat.col+"22" : C.panel2,
                          border: `1px solid ${category === cat.id && !isOneOff ? cat.col : C.border}`,
                          color: category === cat.id && !isOneOff ? cat.col : C.sub,
                          borderRadius: 7, padding: "8px 10px", cursor: "pointer",
                          fontFamily: "inherit", fontSize: 11, fontWeight: category === cat.id && !isOneOff ? 700 : 400,
                          textAlign: "left" as const, transition: "all 0.15s",
                        }}
                      >{cat.label}</button>
                    ))}
                  </div>
                </div>

                {/* One-off toggle */}
                <div
                  onClick={() => setIsOneOff(!isOneOff)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: isOneOff ? C.purple+"15" : C.panel2,
                    border: `1px solid ${isOneOff ? C.purple : C.border}`,
                    borderRadius: 8, cursor: "pointer", marginBottom: 16,
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: isOneOff ? C.purple : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                    {isOneOff ? "✓" : ""}
                  </div>
                  <div>
                    <p style={{ color: isOneOff ? C.purple : C.sub, fontWeight: isOneOff ? 700 : 400, fontSize: 12, margin: 0 }}>⚡ Mark as one-off / unexpected</p>
                    <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>Tracked separately from regular monthly spend</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !amount || !desc}
                  style={{
                    width: "100%", background: saved ? C.green : (!amount || !desc ? C.muted : C.green),
                    color: "#000", border: "none", borderRadius: 8, padding: "13px 0",
                    fontWeight: 900, fontSize: 15, fontFamily: "inherit", cursor: saving ? "wait" : "pointer",
                  }}
                >
                  {saved ? "✅ Logged!" : saving ? "Saving..." : "Log Expense"}
                </button>
              </div>
            </form>

            {/* Recent 5 transactions */}
            {txns.length > 0 && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>🕐 Recent Entries</h3>
                {txns.slice(0, 5).map(t => {
                  const cat = CATEGORIES.find(c => c.id === t.category);
                  return (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: C.text, fontWeight: 600, fontSize: 12, margin: "0 0 3px" }}>{t.description}</p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ color: C.muted, fontSize: 10 }}>{t.date}</span>
                          <Tag label={cat?.label || t.category} col={cat?.col || C.sub} />
                          {t.is_one_off ? <Tag label="one-off" col={C.purple} /> : null}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, marginLeft: 10 }}>
                        <span style={{ color: C.red, fontWeight: 800, fontSize: 14 }}>{eur(t.amount)}</span>
                        <button onClick={() => deleteTxn(t.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {view === "month" && (
          <div>
            {loading && <p style={{ color: C.sub, fontSize: 12 }}>Loading...</p>}
            {!loading && txns.length === 0 && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: "center" as const }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>📭</p>
                <p style={{ color: C.sub, fontSize: 13 }}>No expenses logged for {MONTHS[month-1]} {year} yet.</p>
                <p style={{ color: C.muted, fontSize: 11 }}>Switch to Add tab to log your first expense!</p>
              </div>
            )}
            {Object.entries(byDate).map(([date, dayTxns]) => {
              const dayTotal = dayTxns.reduce((s, t) => s + t.amount, 0);
              return (
                <div key={date} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: C.gold, fontWeight: 700, fontSize: 12 }}>
                      {new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span style={{ color: C.red, fontWeight: 700, fontSize: 12 }}>{eur(dayTotal)}</span>
                  </div>
                  {dayTxns.map(t => {
                    const cat = CATEGORIES.find(c => c.id === t.category);
                    return (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 14px", marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: C.text, fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{t.description}</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                            <Tag label={cat?.label || t.category} col={cat?.col || C.sub} />
                            {t.is_one_off ? <Tag label="⚡ one-off" col={C.purple} /> : null}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, marginLeft: 10 }}>
                          <span style={{ color: C.red, fontWeight: 800, fontSize: 15 }}>{eur(t.amount)}</span>
                          <button onClick={() => deleteTxn(t.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── BY CATEGORY ── */}
        {view === "cats" && (
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: 13, marginBottom: 4 }}>📊 {MONTHS[month-1]} {year} — Spending by Category</h3>
              <p style={{ color: C.sub, fontSize: 11, marginBottom: 16 }}>Total spent: <strong style={{ color: C.red }}>{eur(monthTotal)}</strong></p>

              {CATEGORIES.map(cat => {
                const spent = catTotals[cat.id] || 0;
                if (spent === 0 && cat.budget === 0) return null;
                const pct = cat.budget > 0 ? Math.min(100, Math.round((spent / cat.budget) * 100)) : 0;
                const over = cat.budget > 0 && spent > cat.budget;
                const catTxns = txns.filter(t => t.category === cat.id);
                return (
                  <div key={cat.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{cat.label}</span>
                      <div style={{ textAlign: "right" as const }}>
                        <span style={{ color: over ? C.red : cat.col, fontWeight: 800, fontSize: 14 }}>{eur(spent)}</span>
                        {cat.budget > 0 && <span style={{ color: C.muted, fontSize: 11 }}> / {eur(cat.budget)}</span>}
                      </div>
                    </div>
                    {cat.budget > 0 && (
                      <div style={{ background: C.border, borderRadius: 4, height: 7, marginBottom: 8 }}>
                        <div style={{ width: `${pct}%`, background: over ? C.red : cat.col, height: 7, borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    )}
                    {/* individual transactions under category */}
                    {catTxns.map(t => (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: C.panel2, borderRadius: 6, marginBottom: 4 }}>
                        <div>
                          <span style={{ color: C.sub, fontSize: 11 }}>{t.date} — {t.description}</span>
                          {t.is_one_off ? <Tag label="one-off" col={C.purple} /> : null}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ color: cat.col, fontWeight: 700, fontSize: 12 }}>{eur(t.amount)}</span>
                          <button onClick={() => deleteTxn(t.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
