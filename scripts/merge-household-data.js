const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const HOUSEHOLD_USER_ID = 1; // Sajeev's id — the shared id we'll standardize on going forward

async function getNumericColumns(client, table, excludeCols) {
  const res = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
    [table]
  );
  return res.rows
    .filter(r => !excludeCols.includes(r.column_name))
    .filter(r => ["real", "double precision", "integer", "numeric"].includes(r.data_type))
    .map(r => r.column_name);
}

async function mergeTable(client, table, excludeCols) {
  const numericCols = await getNumericColumns(client, table, excludeCols);
  console.log(`\n📋 ${table}: numeric columns to sum -> ${numericCols.join(", ")}`);

  const pairs = await client.query(
    `SELECT DISTINCT year, month FROM ${table} ORDER BY year, month`
  );

  for (const { year, month } of pairs.rows) {
    const rows = await client.query(
      `SELECT * FROM ${table} WHERE year=$1 AND month=$2 ORDER BY user_id`,
      [year, month]
    );

    if (rows.rows.length === 0) continue;

    if (rows.rows.length === 1) {
      const row = rows.rows[0];
      if (row.user_id !== HOUSEHOLD_USER_ID) {
        await client.query(`UPDATE ${table} SET user_id=$1 WHERE id=$2`, [HOUSEHOLD_USER_ID, row.id]);
        console.log(`  ${year}-${month}: reassigned single row (id ${row.id}) to household user`);
      } else {
        console.log(`  ${year}-${month}: already on household user, no change`);
      }
      continue;
    }

    // Multiple rows for this month — merge them
    const merged = {};
    for (const col of numericCols) {
      merged[col] = rows.rows.reduce((sum, r) => sum + (Number(r[col]) || 0), 0);
    }
    const notesParts = rows.rows.map(r => r.notes).filter(Boolean);
    const mergedNotes = notesParts.join(" | ");

    const setClauses = numericCols.map((c, i) => `${c}=$${i + 1}`).join(", ");
    const notesIdx = numericCols.length + 1;

    // Update the first row to hold the merged values, delete the rest
    const keepRow = rows.rows[0];
    await client.query(
      `UPDATE ${table} SET user_id=$${notesIdx + 1}, ${setClauses}, notes=$${notesIdx} WHERE id=$${notesIdx + 2}`,
      [...numericCols.map(c => merged[c]), mergedNotes, HOUSEHOLD_USER_ID, keepRow.id]
    );

    const idsToDelete = rows.rows.slice(1).map(r => r.id);
    if (idsToDelete.length > 0) {
      await client.query(`DELETE FROM ${table} WHERE id = ANY($1)`, [idsToDelete]);
    }

    console.log(`  ${year}-${month}: merged ${rows.rows.length} rows into id ${keepRow.id} (deleted ${idsToDelete.join(",")})`);
  }
}

async function run() {
  const client = await pool.connect();
  try {
    await mergeTable(client, "monthly_entries", ["id", "user_id", "year", "month", "created_at"]);
    await mergeTable(client, "investments", ["id", "user_id", "year", "month", "created_at"]);
    console.log("\n✅ Merge complete — all data now under the shared household user.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
