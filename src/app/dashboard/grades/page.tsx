import { createGrade, deleteGrade } from "@/app/actions/grades";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Enrollment, Grade } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function GradesPage() {
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

  const grades = (gradesRes.data ?? []) as Grade[];
  const enrollments = (enrollmentsRes.data ?? []) as Enrollment[];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Notes
      </h1>
      <p className="mt-2 text-stone-500">Saisir une note (sur 20) par inscription.</p>

      <ActionForm
        action={createGrade}
        className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <select
          name="enrollment_id"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm lg:col-span-2"
          defaultValue=""
        >
          <option value="" disabled>
            Inscription
          </option>
          {enrollments.map((e) => (
            <option key={e.id} value={e.id}>
              {e.students
                ? `${e.students.last_name} ${e.students.first_name}`
                : "Étudiant"}{" "}
              — {e.courses?.code ?? "Cours"}
            </option>
          ))}
        </select>
        <input
          name="label"
          placeholder="Libellé (ex: Partiel)"
          defaultValue="Examen"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            name="value"
            type="number"
            min={0}
            max={20}
            step={0.25}
            placeholder="Note /20"
            required
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
          <SubmitButton>Ajouter</SubmitButton>
        </div>
      </ActionForm>

      {gradesRes.error ? (
        <p className="mt-4 text-sm text-red-700">{gradesRes.error.message}</p>
      ) : null}

      {grades.length === 0 && !gradesRes.error ? (
        <p className="mt-8 text-sm text-stone-500">
          Aucune note. Crée d&apos;abord des inscriptions.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-stone-300 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Étudiant</th>
                <th className="py-2 pr-3 font-medium">Cours</th>
                <th className="py-2 pr-3 font-medium">Libellé</th>
                <th className="py-2 pr-3 font-medium">Note</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3">
                    {g.enrollments?.students
                      ? `${g.enrollments.students.last_name} ${g.enrollments.students.first_name}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-3">
                    {g.enrollments?.courses?.code ?? "—"}
                  </td>
                  <td className="py-3 pr-3">{g.label}</td>
                  <td className="py-3 pr-3 font-medium">{Number(g.value).toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <ActionForm action={deleteGrade}>
                      <input type="hidden" name="id" value={g.id} />
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
