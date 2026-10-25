"use server";

import { revalidatePath } from "next/cache";
import { enrollmentSchema, formObject, idSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };
  return { supabase, error: null };
}

export async function createEnrollment(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const parsed = enrollmentSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return { error: "Inscription invalide." };
  }

  const { error } = await supabase.from("enrollments").insert(parsed.data);
  if (error) return { error: "Échec de l'inscription." };

  revalidatePath("/dashboard/enrollments");
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEnrollment(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "ID invalide." };

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", id.data);
  if (error) return { error: "Échec de la suppression." };

  revalidatePath("/dashboard/enrollments");
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard");
  return { success: true };
}
