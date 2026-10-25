import { checkDbHealth, type DbHealth } from "@/lib/db-health";
import { createClient } from "@/utils/supabase/server";

export { checkDbHealth };
export type { DbHealth };

export function isMissingTableError(message?: string | null) {
  if (!message) return false;
  return /schema cache|does not exist|PGRST205|relation|Could not find the table/i.test(
    message,
  );
}

/** Load rows only if schema exists; otherwise return missingSchema flag. */
export async function loadTable<T>(
  table: string,
  query: (client: Awaited<ReturnType<typeof createClient>>) => Promise<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
): Promise<
  | { ok: true; rows: T[] }
  | { ok: false; missingSchema: true }
  | { ok: false; missingSchema: false; error: string }
> {
  const health = await checkDbHealth();
  if (health.missingSchema) {
    return { ok: false, missingSchema: true };
  }
  if (!health.ok) {
    return { ok: false, missingSchema: false, error: health.message };
  }

  const supabase = await createClient();
  const { data, error } = await query(supabase);

  if (error) {
    if (isMissingTableError(error.message)) {
      return { ok: false, missingSchema: true };
    }
    return { ok: false, missingSchema: false, error: error.message };
  }

  return { ok: true, rows: (data ?? []) as T[] };
}
