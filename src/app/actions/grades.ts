"use server";

import { revalidatePath } from "next/cache";
import { formObject, gradeSchema, idSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };
  return { supabase, error: null };
}

export async function createGrade(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const parsed = gradeSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return { error: "Note invalide (0–20)." };
  }

  const { error } = await supabase.from("grades").insert(parsed.data);
  if (error) return { error: "Échec de la création." };

  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGrade(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "ID invalide." };

  const { error } = await supabase.from("grades").delete().eq("id", id.data);
  if (error) return { error: "Échec de la suppression." };

  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard");
  return { success: true };
}
