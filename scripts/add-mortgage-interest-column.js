const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(
      "ALTER TABLE monthly_entries ADD COLUMN IF NOT EXISTS mortgage_interest REAL DEFAULT 0"
    );
    console.log("✅ mortgage_interest column ready");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
