import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [students, courses, enrollments, grades, absences] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("grades").select("*", { count: "exact", head: true }),
    supabase.from("absences").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Étudiants",
      value: students.count ?? 0,
      href: "/dashboard/students",
      error: students.error?.message,
    },
    {
      label: "Cours",
      value: courses.count ?? 0,
      href: "/dashboard/courses",
      error: courses.error?.message,
    },
    {
      label: "Inscriptions",
      value: enrollments.count ?? 0,
      href: "/dashboard/enrollments",
      error: enrollments.error?.message,
    },
    {
      label: "Notes",
      value: grades.count ?? 0,
      href: "/dashboard/grades",
      error: grades.error?.message,
    },
    {
      label: "Absences",
      value: absences.count ?? 0,
      href: "/dashboard/absences",
      error: absences.error?.message,
    },
  ];

  const schemaMissing = stats.some(
    (s) => s.error && /relation|does not exist|schema cache/i.test(s.error),
  );

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Vue d&apos;ensemble
      </h1>
      <p className="mt-2 text-stone-500">
        Suivi rapide des étudiants, cours, notes et absences.
      </p>

      {schemaMissing ? (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Les tables Supabase ne sont pas encore créées. Exécute le SQL de{" "}
          <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>{" "}
          dans le SQL Editor du projet Supabase, puis recharge cette page.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="rounded-lg border border-stone-200 bg-white/80 p-5 transition hover:border-teal-700"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-teal-900">
              {stat.error && !schemaMissing ? "—" : stat.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
