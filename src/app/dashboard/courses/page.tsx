import { createCourse, deleteCourse } from "@/app/actions/courses";
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
} from "@/components/ui";
import { loadTable } from "@/lib/db";
import type { Course } from "@/lib/types";

export const instant = false;

export default async function CoursesPage() {
  const result = await loadTable<Course>("courses", (supabase) =>
    supabase.from("courses").select("*").order("code"),
  );

  if (!result.ok && result.missingSchema) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cours" description="Installation requise." />
        <SchemaSetup />
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cours" description="Erreur de chargement." />
        <Alert tone="error">{result.error}</Alert>
      </div>
    );
  }

  const courses = result.rows;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cours"
        description="Définis les matières (code, titre, crédits)."
      />

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

      {courses.length === 0 ? (
        <EmptyState
          message="Aucun cours."
          hint="Ajoute au moins un cours avant les inscriptions."
        />
      ) : (
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
      )}
    </div>
  );
}
