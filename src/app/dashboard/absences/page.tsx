import { createAbsence, deleteAbsence } from "@/app/actions/absences";
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
import type { Absence, Course, Student } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function AbsencesPage() {
  const health = await checkDbHealth();
  if (health.missingSchema) {
    return (
      <div className="space-y-6">
        <PageHeader title="Absences" description="Installation requise." />
        <SchemaSetup />
      </div>
    );
  }

  const supabase = await createClient();
  const [absencesRes, studentsRes, coursesRes] = await Promise.all([
    supabase
      .from("absences")
      .select("*, students(first_name, last_name), courses(code, title)")
      .order("date", { ascending: false }),
    supabase.from("students").select("*").order("last_name"),
    supabase.from("courses").select("*").order("code"),
  ]);

  if (absencesRes.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Absences" description="Erreur." />
        <Alert tone="error">
          Impossible de charger les absences. Vérifie l&apos;installation
          Supabase.
        </Alert>
        <SchemaSetup compact />
      </div>
    );
  }

  const absences = (absencesRes.data ?? []) as Absence[];
  const students = (studentsRes.data ?? []) as Student[];
  const courses = (coursesRes.data ?? []) as Course[];
  const today = new Date().toISOString().slice(0, 10);
  const canAdd = students.length > 0 && courses.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absences"
        description="Enregistre une absence pour un étudiant et un cours."
      />

      <Panel title="Nouvelle absence">
        {!canAdd ? (
          <Alert tone="warn">Ajoute d&apos;abord un étudiant et un cours.</Alert>
        ) : (
          <ActionForm
            action={createAbsence}
            successMessage="Absence enregistrée."
            className="grid gap-4 sm:grid-cols-2"
          >
            <SelectField
              label="Étudiant"
              name="student_id"
              required
              placeholder="Choisir un étudiant"
              options={students.map((s) => ({
                value: s.id,
                label: `${s.last_name} ${s.first_name}`,
              }))}
            />
            <SelectField
              label="Cours"
              name="course_id"
              required
              placeholder="Choisir un cours"
              options={courses.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.title}`,
              }))}
            />
            <Field
              label="Date"
              name="date"
              type="date"
              required
              defaultValue={today}
            />
            <Field
              label="Motif (optionnel)"
              name="reason"
              placeholder="Maladie, retard…"
            />
            <div className="sm:col-span-2">
              <SubmitButton>Enregistrer l&apos;absence</SubmitButton>
            </div>
          </ActionForm>
        )}
      </Panel>

      {absences.length === 0 ? (
        <EmptyState message="Aucune absence." />
      ) : (
        <DataTable headers={["Date", "Étudiant", "Cours", "Motif"]}>
          {absences.map((a) => (
            <tr key={a.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium">{a.date}</td>
              <td className="px-4 py-3">
                {a.students
                  ? `${a.students.last_name} ${a.students.first_name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">{a.courses?.code ?? "—"}</td>
              <td className="px-4 py-3 text-stone-600">{a.reason || "—"}</td>
              <td className="px-4 py-3 text-right">
                <ActionForm action={deleteAbsence}>
                  <input type="hidden" name="id" value={a.id} />
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
