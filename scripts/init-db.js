const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS monthly_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        income REAL DEFAULT 0,
        tgv REAL DEFAULT 0,
        address_maintenance REAL DEFAULT 0,
        loan_524 REAL DEFAULT 0,
        loan_93 REAL DEFAULT 0,
        loan_500 REAL DEFAULT 0,
        phone_loan REAL DEFAULT 0,
        phone_connection REAL DEFAULT 0,
        navigo REAL DEFAULT 0,
        tcl REAL DEFAULT 0,
        india_transfer REAL DEFAULT 0,
        gym REAL DEFAULT 0,
        amex REAL DEFAULT 0,
        rent REAL DEFAULT 0,
        electricity REAL DEFAULT 0,
        water REAL DEFAULT 0,
        wifi REAL DEFAULT 0,
        groceries REAL DEFAULT 0,
        youtube REAL DEFAULT 0,
        personal REAL DEFAULT 0,
        other REAL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, year, month)
      );

      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        pea_balance REAL DEFAULT 0,
        pea_contributed REAL DEFAULT 0,
        av_balance REAL DEFAULT 0,
        av_contributed REAL DEFAULT 0,
        per_balance REAL DEFAULT 0,
        pee_balance REAL DEFAULT 0,
        livret_a_balance REAL DEFAULT 0,
        ldds_balance REAL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, year, month)
      );

      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        owner TEXT NOT NULL,
        original_capital REAL NOT NULL,
        current_capital REAL NOT NULL,
        monthly_payment REAL NOT NULL,
        interest_rate REAL NOT NULL,
        start_date TEXT NOT NULL,
        expected_end TEXT,
        is_active INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        target_date TEXT,
        category TEXT,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT DEFAULT '',
        description TEXT NOT NULL,
        is_one_off INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed users
    const existing = await client.query("SELECT COUNT(*) as c FROM users");
    if (parseInt(existing.rows[0].c) === 0) {
      const hash = (pw) => bcrypt.hashSync(pw, 10);
      await client.query("INSERT INTO users (name, username, password_hash) VALUES ($1,$2,$3)", ["Sajeev","sajeev",hash("finance2026")]);
      await client.query("INSERT INTO users (name, username, password_hash) VALUES ($1,$2,$3)", ["Shikha","shikha",hash("finance2026")]);
      console.log("✅ Users created");
    }

    // Seed loans
    const existingLoans = await client.query("SELECT COUNT(*) as c FROM loans");
    if (parseInt(existingLoans.rows[0].c) === 0) {
      const loans = [
        ["Phone Loan (Sajeev)", "Sajeev", 550, 550, 110, 0, "2026-01-01", "2026-09-01"],
        ["Consumer Loan €524 (Sajeev)", "Sajeev", 8000, 8000, 524, 5.5, "2024-01-01", "2026-11-01"],
        ["Consumer Loan €93 (Sajeev)", "Sajeev", 930, 930, 93, 4.5, "2024-01-01", "2027-12-01"],
        ["Consumer Loan €500 (Shikha)", "Shikha", 8000, 8000, 500, 5.5, "2024-01-01", "2027-03-01"],
      ];
      for (const l of loans) {
        await client.query("INSERT INTO loans (name,owner,original_capital,current_capital,monthly_payment,interest_rate,start_date,expected_end) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", l);
      }
      console.log("✅ Loans seeded");
    }

    // Seed goals
    const existingGoals = await client.query("SELECT COUNT(*) as c FROM goals");
    if (parseInt(existingGoals.rows[0].c) === 0) {
      const goals = [
        ["Apport (Mortgage)", 13506, 11400, "2026-12-01", "apport", "Min €6k needed"],
        ["Emergency Fund", 21000, 4000, "2028-06-01", "savings", "3 months expenses"],
        ["India Trip Fund", 5000, 0, "2027-01-01", "lifestyle", "€417/mo target"],
        ["Holiday Fund", 2000, 0, "2027-06-01", "lifestyle", "€167/mo target"],
        ["Baby Fund", 2500, 0, "2027-06-01", "family", "Prep costs"],
        ["PEA Target (combined)", 150000, 1522, "2031-04-01", "investment", "Both PEAs"],
        ["Mortgage Payoff", 359000, 0, "2035-01-01", "mortgage", "Target 9 years"],
      ];
      for (const g of goals) {
        await client.query("INSERT INTO goals (name,target_amount,current_amount,target_date,category,notes) VALUES ($1,$2,$3,$4,$5,$6)", g);
      }
      console.log("✅ Goals seeded");
    }

    console.log("✅ Database ready!");
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch(console.error);
