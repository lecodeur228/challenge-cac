"use server";

import { redirect } from "next/navigation";
import { authSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

const GENERIC_AUTH_ERROR = "Identifiants invalides.";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function login(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const invite = String(formData.get("invite_code") ?? "");
  const expected = process.env.SIGNUP_INVITE_CODE ?? "";

  if (!expected || !timingSafeEqual(invite, expected)) {
    return { error: "Code d'invitation invalide." };
  }

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error:
        "Email ou mot de passe invalide (min. 8 caractères).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: "Impossible de créer le compte." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
