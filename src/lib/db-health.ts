import { createClient } from "@/utils/supabase/server";

export type DbHealth = {
  ok: boolean;
  missingSchema: boolean;
  message: string;
  counts: Record<string, number | null>;
};

const TABLES = [
  "students",
  "courses",
  "enrollments",
  "grades",
  "absences",
] as const;

export async function checkDbHealth(): Promise<DbHealth> {
  const supabase = await createClient();
  const counts: Record<string, number | null> = {};
  let missingSchema = false;
  let firstError = "";

  for (const table of TABLES) {
    // Real select — head:true can hide missing-table errors (HTTP 204).
    const probe = await supabase.from(table).select("id").limit(1);
    if (probe.error || probe.status === 404) {
      counts[table] = null;
      const msg = probe.error?.message ?? `HTTP ${probe.status}`;
      firstError ||= msg;
      if (/schema cache|does not exist|PGRST205|relation|404/i.test(msg)) {
        missingSchema = true;
      }
      continue;
    }

    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      counts[table] = null;
      firstError ||= error.message;
    } else {
      counts[table] = count ?? 0;
    }
  }

  if (missingSchema) {
    return {
      ok: false,
      missingSchema: true,
      message:
        "Supabase répond, mais les tables Studia n'existent pas encore. Ouvre le SQL Editor et exécute le fichier supabase/schema.sql, puis recharge.",
      counts,
    };
  }

  if (firstError) {
    return {
      ok: false,
      missingSchema: false,
      message: `Erreur base de données : ${firstError}`,
      counts,
    };
  }

  return {
    ok: true,
    missingSchema: false,
    message: "Connexion Supabase OK — tables prêtes.",
    counts,
  };
}
