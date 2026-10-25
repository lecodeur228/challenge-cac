import { createAbsence, deleteAbsence } from "@/app/actions/absences";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Absence, Course, Student } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function AbsencesPage() {
  const supabase = await createClient();

  const [absencesRes, studentsRes, coursesRes] = await Promise.all([
    supabase
      .from("absences")
      .select("*, students(first_name, last_name), courses(code, title)")
      .order("date", { ascending: false }),
    supabase.from("students").select("*").order("last_name"),
    supabase.from("courses").select("*").order("code"),
  ]);

  const absences = (absencesRes.data ?? []) as Absence[];
  const students = (studentsRes.data ?? []) as Student[];
  const courses = (coursesRes.data ?? []) as Course[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Absences
      </h1>
      <p className="mt-2 text-stone-500">Enregistrer les absences par cours.</p>

      <ActionForm
        action={createAbsence}
        className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-5"
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
              {c.code}
            </option>
          ))}
        </select>
        <input
          name="date"
          type="date"
          required
          defaultValue={today}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="reason"
          placeholder="Motif (optionnel)"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <SubmitButton>Ajouter</SubmitButton>
      </ActionForm>

      {absencesRes.error ? (
        <p className="mt-4 text-sm text-red-700">{absencesRes.error.message}</p>
      ) : null}

      {absences.length === 0 && !absencesRes.error ? (
        <p className="mt-8 text-sm text-stone-500">Aucune absence enregistrée.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-stone-300 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Étudiant</th>
                <th className="py-2 pr-3 font-medium">Cours</th>
                <th className="py-2 pr-3 font-medium">Motif</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {absences.map((a) => (
                <tr key={a.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3">{a.date}</td>
                  <td className="py-3 pr-3">
                    {a.students
                      ? `${a.students.last_name} ${a.students.first_name}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-3">{a.courses?.code ?? "—"}</td>
                  <td className="py-3 pr-3">{a.reason || "—"}</td>
                  <td className="py-3 text-right">
                    <ActionForm action={deleteAbsence}>
                      <input type="hidden" name="id" value={a.id} />
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
