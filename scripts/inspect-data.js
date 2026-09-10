const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const users = await client.query("SELECT id, name, username FROM users ORDER BY id");
    console.log("👤 Users:", JSON.stringify(users.rows));

    const entries = await client.query(
      "SELECT user_id, year, month, income FROM monthly_entries ORDER BY year, month, user_id"
    );
    console.log("📅 Monthly entries (user_id, year, month, income):");
    entries.rows.forEach(r => console.log(`   user ${r.user_id} — ${r.year}-${r.month} — income ${r.income}`));

    const invs = await client.query(
      "SELECT user_id, year, month, pea_balance, av_balance, livret_a_balance FROM investments ORDER BY year, month, user_id"
    );
    console.log("📈 Investment entries (user_id, year, month, pea, av, livretA):");
    invs.rows.forEach(r => console.log(`   user ${r.user_id} — ${r.year}-${r.month} — PEA ${r.pea_balance}, AV ${r.av_balance}, Livret A ${r.livret_a_balance}`));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
