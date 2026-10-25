import { createCourse, deleteCourse } from "@/app/actions/courses";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Course } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("code");

  const courses = (data ?? []) as Course[];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Cours
      </h1>
      <p className="mt-2 text-stone-500">Catalogue des cours.</p>

      <ActionForm
        action={createCourse}
        className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input
          name="code"
          placeholder="Code (ex: INFO101)"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="title"
          placeholder="Titre"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="credits"
          type="number"
          min={1}
          max={30}
          defaultValue={3}
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <SubmitButton>Ajouter</SubmitButton>
      </ActionForm>

      {error ? (
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      ) : null}

      {courses.length === 0 && !error ? (
        <p className="mt-8 text-sm text-stone-500">Aucun cours pour le moment.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-stone-300 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Code</th>
                <th className="py-2 pr-3 font-medium">Titre</th>
                <th className="py-2 pr-3 font-medium">Crédits</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3 font-medium">{c.code}</td>
                  <td className="py-3 pr-3">{c.title}</td>
                  <td className="py-3 pr-3">{c.credits}</td>
                  <td className="py-3 text-right">
                    <ActionForm action={deleteCourse}>
                      <input type="hidden" name="id" value={c.id} />
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
