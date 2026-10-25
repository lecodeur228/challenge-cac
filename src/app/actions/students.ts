"use server";

import { revalidatePath } from "next/cache";
import { formObject, idSchema, studentSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };
  return { supabase, error: null };
}

export async function createStudent(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const parsed = studentSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return { error: "Données étudiant invalides." };
  }

  const { error } = await supabase.from("students").insert(parsed.data);
  if (error) {
    if (/schema cache|does not exist|PGRST205/i.test(error.message)) {
      return {
        error:
          "Tables absentes. Sur Accueil, copie le SQL et exécute-le dans Supabase.",
      };
    }
    return { error: "Échec de la création (email déjà utilisé ?)." };
  }

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStudent(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "ID invalide." };

  const { error } = await supabase.from("students").delete().eq("id", id.data);
  if (error) return { error: "Échec de la suppression." };

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  return { success: true };
}
