import { createGrade, deleteGrade } from "@/app/actions/grades";
import { ActionForm } from "@/components/FormMessage";
import { SchemaSetup } from "@/components/SchemaSetup";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Alert,
  DataTable,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  SelectField,
} from "@/components/ui";
import { checkDbHealth } from "@/lib/db-health";
import type { Enrollment, Grade } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function GradesPage() {
  const health = await checkDbHealth();
  if (health.missingSchema) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notes" description="Installation requise." />
        <SchemaSetup />
      </div>
    );
  }

  const supabase = await createClient();
  const [gradesRes, enrollmentsRes] = await Promise.all([
    supabase
      .from("grades")
      .select(
        "*, enrollments(id, students(first_name, last_name), courses(code, title))",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("*, students(first_name, last_name), courses(code, title)")
      .order("created_at", { ascending: false }),
  ]);

  if (gradesRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notes" description="Erreur." />
        <Alert tone="error">
          Impossible de charger les notes. Vérifie l&apos;installation Supabase.
        </Alert>
        <SchemaSetup compact />
      </div>
    );
  }

  const grades = (gradesRes.data ?? []) as Grade[];
  const enrollments = (enrollmentsRes.data ?? []) as Enrollment[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Saisis une note sur 20 pour une inscription."
      />

      <Panel title="Nouvelle note">
        {enrollments.length === 0 ? (
          <Alert tone="warn">
            Crée d&apos;abord une inscription (menu Inscriptions).
          </Alert>
        ) : (
          <ActionForm
            action={createGrade}
            successMessage="Note enregistrée."
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <SelectField
                label="Inscription"
                name="enrollment_id"
                required
                placeholder="Choisir étudiant + cours"
                options={enrollments.map((e) => ({
                  value: e.id,
                  label: `${e.students ? `${e.students.last_name} ${e.students.first_name}` : "Étudiant"} — ${e.courses?.code ?? "Cours"}`,
                }))}
              />
            </div>
            <Field
              label="Libellé"
              name="label"
              required
              defaultValue="Examen"
              placeholder="Partiel, TP…"
            />
            <Field
              label="Note / 20"
              name="value"
              type="number"
              min={0}
              max={20}
              step={0.25}
              required
              placeholder="15.5"
            />
            <div className="sm:col-span-2">
              <SubmitButton>Enregistrer la note</SubmitButton>
            </div>
          </ActionForm>
        )}
      </Panel>

      {grades.length === 0 ? (
        <EmptyState message="Aucune note." />
      ) : (
        <DataTable headers={["Étudiant", "Cours", "Libellé", "Note"]}>
          {grades.map((g) => (
            <tr key={g.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium">
                {g.enrollments?.students
                  ? `${g.enrollments.students.last_name} ${g.enrollments.students.first_name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">{g.enrollments?.courses?.code ?? "—"}</td>
              <td className="px-4 py-3">{g.label}</td>
              <td className="px-4 py-3 font-semibold">
                {Number(g.value).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <ActionForm action={deleteGrade}>
                  <input type="hidden" name="id" value={g.id} />
                  <SubmitButton variant="danger">Supprimer</SubmitButton>
                </ActionForm>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
