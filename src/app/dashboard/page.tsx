import Link from "next/link";
import { SchemaSetup } from "@/components/SchemaSetup";
import { SeedButton } from "@/components/SeedButton";
import { Alert, PageHeader, Panel } from "@/components/ui";
import { checkDbHealth } from "@/lib/db-health";

export const instant = false;

export default async function DashboardPage() {
  const health = await checkDbHealth();
  const empty =
    health.ok &&
    Object.values(health.counts).every((c) => c === 0 || c === null);

  const stats = [
    { label: "Étudiants", href: "/dashboard/students", key: "students" },
    { label: "Cours", href: "/dashboard/courses", key: "courses" },
    { label: "Inscriptions", href: "/dashboard/enrollments", key: "enrollments" },
    { label: "Notes", href: "/dashboard/grades", key: "grades" },
    { label: "Absences", href: "/dashboard/absences", key: "absences" },
  ] as const;

  if (health.missingSchema) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Accueil"
          description="Avant d’utiliser Studia, installe les tables Supabase."
        />
        <SchemaSetup />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accueil"
        description="Ajoute des étudiants, des cours, puis les inscriptions, notes et absences."
      />

      <Alert tone={health.ok ? "ok" : "error"}>{health.message}</Alert>

      {empty ? (
        <Panel title="Données de démo">
          <p className="mb-3 text-sm text-stone-600">
            Base vide. Charge un jeu de test pour le pentest et les démos.
          </p>
          <SeedButton />
        </Panel>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const value = health.counts[stat.key];
          return (
            <Link
              key={stat.href}
              href={stat.href}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-700 hover:shadow"
            >
              <p className="text-sm font-medium text-stone-500">{stat.label}</p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl text-teal-900">
                {health.ok ? (value ?? 0) : "—"}
              </p>
              <p className="mt-3 text-sm font-medium text-teal-800">Ouvrir →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
