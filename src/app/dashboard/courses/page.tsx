import { createCourse, deleteCourse } from "@/app/actions/courses";
import { ActionForm } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Alert,
  DataTable,
  EmptyState,
  Field,
  PageHeader,
  Panel,
} from "@/components/ui";
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
    <div className="space-y-6">
      <PageHeader
        title="Cours"
        description="Définis les matières (code, titre, crédits)."
      />

      {error ? <Alert tone="error">{error.message}</Alert> : null}

      <Panel title="Nouveau cours">
        <ActionForm
          action={createCourse}
          successMessage="Cours ajouté."
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Code" name="code" required placeholder="INFO101" />
          <Field label="Titre" name="title" required placeholder="Algorithmique" />
          <Field
            label="Crédits"
            name="credits"
            type="number"
            min={1}
            max={30}
            defaultValue={3}
            required
          />
          <div className="flex items-end">
            <SubmitButton className="w-full">Ajouter le cours</SubmitButton>
          </div>
        </ActionForm>
      </Panel>

      {courses.length === 0 && !error ? (
        <EmptyState
          message="Aucun cours."
          hint="Ajoute au moins un cours avant les inscriptions."
        />
      ) : courses.length > 0 ? (
        <DataTable headers={["Code", "Titre", "Crédits"]}>
          {courses.map((c) => (
            <tr key={c.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium">{c.code}</td>
              <td className="px-4 py-3">{c.title}</td>
              <td className="px-4 py-3">{c.credits}</td>
              <td className="px-4 py-3 text-right">
                <ActionForm action={deleteCourse}>
                  <input type="hidden" name="id" value={c.id} />
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
