const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();

async function run() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase\n');

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`Running ${file}...`);
    try {
      await client.query(sql);
      console.log(`  ✓ ${file}\n`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}\n`);
      await client.end();
      process.exit(1);
    }
  }

  console.log('All migrations complete.');
  await client.end();
}

run();
