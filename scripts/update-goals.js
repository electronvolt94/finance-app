const { Pool } = require("pg");
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
 
async function run() {
  const client = await pool.connect();
  try {
    const del = await client.query("DELETE FROM goals WHERE category = 'apport'");
    console.log(`🗑️ Removed ${del.rowCount} apport goal(s)`);
 
    const upd = await client.query("UPDATE goals SET name = 'Investment' WHERE category = 'investment'");
    console.log(`✏️ Renamed ${upd.rowCount} investment goal(s) to 'Investment'`);
  } finally {
    client.release();
    await pool.end();
  }
}
 
run().catch(console.error);
