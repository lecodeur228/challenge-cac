import { createStudent, deleteStudent } from "@/app/actions/students";
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
import type { Student } from "@/lib/types";

export const instant = false;

export default async function StudentsPage() {
  const result = await loadTable<Student>("students", (supabase) =>
    supabase.from("students").select("*").order("last_name"),
  );

  if (!result.ok && result.missingSchema) {
    return (
      <div className="space-y-6">
        <PageHeader title="Étudiants" description="Installation requise." />
        <SchemaSetup />
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Étudiants" description="Erreur de chargement." />
        <Alert tone="error">{result.error}</Alert>
      </div>
    );
  }

  const students = result.rows;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Étudiants"
        description="Crée un étudiant avec son email et sa filière."
      />

      <Panel title="Nouvel étudiant">
        <ActionForm
          action={createStudent}
          successMessage="Étudiant ajouté."
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Prénom" name="first_name" required placeholder="Marie" />
          <Field label="Nom" name="last_name" required placeholder="Curie" />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            placeholder="marie@ecole.fr"
          />
          <Field
            label="Filière"
            name="program"
            required
            placeholder="Informatique"
          />
          <Field
            label="Année"
            name="year"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
          />
          <div className="flex items-end">
            <SubmitButton className="w-full sm:w-auto">
              Ajouter l&apos;étudiant
            </SubmitButton>
          </div>
        </ActionForm>
      </Panel>

      {students.length === 0 ? (
        <EmptyState
          message="Aucun étudiant pour l’instant."
          hint="Utilise le formulaire ci-dessus pour en ajouter un."
        />
      ) : (
        <DataTable headers={["Nom", "Email", "Filière", "Année"]}>
          {students.map((s) => (
            <tr key={s.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium text-stone-900">
                {s.last_name} {s.first_name}
              </td>
              <td className="px-4 py-3 text-stone-600">{s.email}</td>
              <td className="px-4 py-3 text-stone-600">{s.program}</td>
              <td className="px-4 py-3 text-stone-600">{s.year}</td>
              <td className="px-4 py-3 text-right">
                <ActionForm action={deleteStudent}>
                  <input type="hidden" name="id" value={s.id} />
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
