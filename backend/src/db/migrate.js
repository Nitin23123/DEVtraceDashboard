const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
// Arbitrary constant so concurrent instances (e.g. a rolling deploy) never migrate at the same time.
const LOCK_ID = 727274;

/**
 * Applies every migrations/*.sql file not yet recorded in schema_migrations,
 * in filename order, each inside its own transaction.
 * All migrations are written to be re-runnable, so a database that predates
 * this runner simply replays them once as no-ops before being tracked.
 */
async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename   VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
       )`
    );

    const { rows } = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.filename));
    const pending = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql') && !applied.has(f))
      .sort();

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied migration ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}

module.exports = { runMigrations };

// `npm run migrate` — apply pending migrations and exit.
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
