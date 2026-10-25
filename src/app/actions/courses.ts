"use server";

import { revalidatePath } from "next/cache";
import { courseSchema, formObject, idSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié." as const };
  return { supabase, error: null };
}

export async function createCourse(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const parsed = courseSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return { error: "Données cours invalides." };
  }

  const { error } = await supabase.from("courses").insert(parsed.data);
  if (error) return { error: "Échec de la création." };

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const { supabase, error: authError } = await requireUser();
  if (authError) return { error: authError };

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "ID invalide." };

  const { error } = await supabase.from("courses").delete().eq("id", id.data);
  if (error) return { error: "Échec de la suppression." };

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard");
  return { success: true };
}
