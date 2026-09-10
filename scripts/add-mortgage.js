const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT id FROM loans WHERE name = $1",
      ["Home Mortgage (Clamart)"]
    );
    if (existing.rows.length > 0) {
      console.log("⚠️ Mortgage loan already exists, skipping insert.");
      return;
    }

    await client.query(
      `INSERT INTO loans (name, owner, original_capital, current_capital, monthly_payment, interest_rate, start_date, expected_end)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        "Home Mortgage (Clamart)",
        "Joint",
        353000,
        353000,
        1797.27,
        3.30,
        "2028-08-01",
        "2052-08-01",
      ]
    );
    console.log("✅ Mortgage loan added");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
