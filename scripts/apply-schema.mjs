/**
 * Apply supabase/schema.sql using DATABASE_URL (Postgres connection string).
 * Usage: DATABASE_URL="postgresql://..." node scripts/apply-schema.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "schema.sql");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL. Get it from Supabase → Project Settings → Database → Connection string (URI).");
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Schema applied successfully.");

  const { rows } = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('students','courses','enrollments','grades','absences')
    order by table_name
  `);
  console.log(
    "Tables:",
    rows.map((r) => r.table_name).join(", ") || "(none)",
  );
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
