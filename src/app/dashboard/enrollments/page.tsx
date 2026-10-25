import { createEnrollment, deleteEnrollment } from "@/app/actions/enrollments";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Course, Enrollment, Student } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function EnrollmentsPage() {
  const supabase = await createClient();

  const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, students(id, first_name, last_name, email), courses(id, code, title)")
      .order("created_at", { ascending: false }),
    supabase.from("students").select("*").order("last_name"),
    supabase.from("courses").select("*").order("code"),
  ]);

  const enrollments = (enrollmentsRes.data ?? []) as Enrollment[];
  const students = (studentsRes.data ?? []) as Student[];
  const courses = (coursesRes.data ?? []) as Course[];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Inscriptions
      </h1>
      <p className="mt-2 text-stone-500">Lier un étudiant à un cours.</p>

      <ActionForm
        action={createEnrollment}
        className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-white/80 p-4 sm:grid-cols-3"
      >
        <select
          name="student_id"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Étudiant
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.last_name} {s.first_name}
            </option>
          ))}
        </select>
        <select
          name="course_id"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Cours
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
        <SubmitButton>Inscrire</SubmitButton>
      </ActionForm>

      {enrollmentsRes.error ? (
        <p className="mt-4 text-sm text-red-700">{enrollmentsRes.error.message}</p>
      ) : null}

      {enrollments.length === 0 && !enrollmentsRes.error ? (
        <p className="mt-8 text-sm text-stone-500">
          Aucune inscription. Ajoute d&apos;abord des étudiants et des cours.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-stone-300 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Étudiant</th>
                <th className="py-2 pr-3 font-medium">Cours</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3">
                    {e.students
                      ? `${e.students.last_name} ${e.students.first_name}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-3">
                    {e.courses ? `${e.courses.code} — ${e.courses.title}` : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <ActionForm action={deleteEnrollment}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="text-red-700 hover:underline"
                      >
                        Supprimer
                      </button>
                    </ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
