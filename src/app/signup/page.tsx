import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export const instant = false;

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="font-[family-name:var(--font-fraunces)] text-4xl text-teal-900">
          Studia
        </p>
        <h1 className="mt-3 text-xl font-semibold text-stone-900">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Il te faut le code d&apos;invitation, puis un email et un mot de passe
          (8 caractères minimum).
        </p>

        <AuthForm action={signup} submitLabel="Créer mon compte" showInvite />

        <p className="mt-6 text-sm text-stone-600">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold text-teal-800 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
