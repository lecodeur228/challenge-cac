import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

const sb = createClient(url, key);
const tables = ["students", "courses", "enrollments", "grades", "absences"];
let ok = true;

for (const t of tables) {
  // IMPORTANT: do not use head:true alone — missing tables can return 204 without error.
  const { data, error, status } = await sb.from(t).select("id").limit(1);
  if (error || status === 404) {
    ok = false;
    console.log(`FAIL ${t}: ${error?.message ?? `status ${status}`}`);
  } else {
    console.log(`OK   ${t} (sample rows: ${data?.length ?? 0})`);
  }
}

if (!ok) {
  console.log("\nFix: run supabase/schema.sql in Supabase SQL Editor");
  console.log("Or: DATABASE_URL=... npm run db:setup");
}

process.exit(ok ? 0 : 2);
