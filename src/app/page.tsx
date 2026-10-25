import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  // Supabase sometimes redirects confirm emails to Site URL (/) with ?code=
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
