"use server";

import { revalidatePath } from "next/cache";
import { absenceSchema, formObject, idSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };
  return { supabase, error: null };
}

export async function createAbsence(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const parsed = absenceSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return { error: "Absence invalide." };
  }

  const { error } = await supabase.from("absences").insert(parsed.data);
  if (error) return { error: "Échec de la création." };

  revalidatePath("/dashboard/absences");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAbsence(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "ID invalide." };

  const { error } = await supabase.from("absences").delete().eq("id", id.data);
  if (error) return { error: "Échec de la suppression." };

  revalidatePath("/dashboard/absences");
  revalidatePath("/dashboard");
  return { success: true };
}
