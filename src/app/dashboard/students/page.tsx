import { createStudent, deleteStudent } from "@/app/actions/students";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Student } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("last_name");

  const students = (data ?? []) as Student[];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-stone-900">
        Étudiants
      </h1>
      <p className="mt-2 text-stone-500">Ajouter et gérer les étudiants.</p>

      <ActionForm
        action={createStudent}
        className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          name="first_name"
          placeholder="Prénom"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="last_name"
          placeholder="Nom"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="program"
          placeholder="Filière"
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          name="year"
          type="number"
          min={1}
          max={10}
          defaultValue={1}
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <SubmitButton>Ajouter</SubmitButton>
      </ActionForm>

      {error ? (
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      ) : null}

      {students.length === 0 && !error ? (
        <p className="mt-8 text-sm text-stone-500">Aucun étudiant pour le moment.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-300 text-stone-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Nom</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Filière</th>
                <th className="py-2 pr-3 font-medium">Année</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3">
                    {s.last_name} {s.first_name}
                  </td>
                  <td className="py-3 pr-3">{s.email}</td>
                  <td className="py-3 pr-3">{s.program}</td>
                  <td className="py-3 pr-3">{s.year}</td>
                  <td className="py-3 text-right">
                    <ActionForm action={deleteStudent}>
                      <input type="hidden" name="id" value={s.id} />
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
