import { createEnrollment, deleteEnrollment } from "@/app/actions/enrollments";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Alert,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  SelectField,
} from "@/components/ui";
import type { Course, Enrollment, Student } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function EnrollmentsPage() {
  const supabase = await createClient();

  const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        "*, students(id, first_name, last_name, email), courses(id, code, title)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("students").select("*").order("last_name"),
    supabase.from("courses").select("*").order("code"),
  ]);

  const enrollments = (enrollmentsRes.data ?? []) as Enrollment[];
  const students = (studentsRes.data ?? []) as Student[];
  const courses = (coursesRes.data ?? []) as Course[];
  const canEnroll = students.length > 0 && courses.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inscriptions"
        description="Associe un étudiant à un cours."
      />

      {enrollmentsRes.error ? (
        <Alert tone="error">{enrollmentsRes.error.message}</Alert>
      ) : null}

      <Panel title="Nouvelle inscription">
        {!canEnroll ? (
          <Alert tone="warn">
            Il faut d&apos;abord au moins 1 étudiant et 1 cours.
          </Alert>
        ) : (
          <ActionForm
            action={createEnrollment}
            successMessage="Inscription créée."
            className="grid gap-4 sm:grid-cols-3"
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
            <div className="flex items-end">
              <SubmitButton className="w-full">Inscrire</SubmitButton>
            </div>
          </ActionForm>
        )}
      </Panel>

      {enrollments.length === 0 && !enrollmentsRes.error ? (
        <EmptyState message="Aucune inscription." />
      ) : enrollments.length > 0 ? (
        <DataTable headers={["Étudiant", "Cours"]}>
          {enrollments.map((e) => (
            <tr key={e.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium">
                {e.students
                  ? `${e.students.last_name} ${e.students.first_name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {e.courses ? `${e.courses.code} — ${e.courses.title}` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <ActionForm action={deleteEnrollment}>
                  <input type="hidden" name="id" value={e.id} />
                  <SubmitButton variant="danger">Supprimer</SubmitButton>
                </ActionForm>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </div>
  );
}
