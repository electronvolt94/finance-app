"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else { setError(data.error || "Invalid credentials"); setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <h1 style={{ color: "#059669", fontWeight: 900, fontSize: 20, margin: "0 0 4px" }}>Finance Tracker</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Sajeev & Shikha — Financial Liberation Plan</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="sajeev or shikha" required autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 14, textAlign: "center" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#94a3b8" : "#059669", color: "#000", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 800, fontSize: 14, transition: "background 0.15s" }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 20 }}>
          Running locally on your machine 🔒
        </p>
      </div>
    </div>
  );
}
