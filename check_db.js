const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '') : null;

async function main() {
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env');
    return;
  }
  const pool = new Pool({ connectionString: dbUrl });
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
main();
