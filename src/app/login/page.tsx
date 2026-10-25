import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { Alert } from "@/components/ui";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-[family-name:var(--font-fraunces)] text-4xl text-teal-900">
          Studia
        </p>
        <h1 className="mt-3 text-xl font-semibold text-stone-900">Connexion</h1>
        <p className="mt-1 text-sm text-stone-600">
          Entre ton email et ton mot de passe admin.
        </p>

        {params.error === "confirmation" ? (
          <div className="mt-4">
            <Alert tone="warn">
              Lien de confirmation invalide ou expiré. Réessaie de te connecter
              ou crée un nouveau compte.
            </Alert>
          </div>
        ) : null}

        <AuthForm action={login} submitLabel="Se connecter" />

        <p className="mt-6 text-sm text-stone-600">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-teal-800 underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
