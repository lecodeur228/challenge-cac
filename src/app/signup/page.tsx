import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export const instant = false;

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <p className="font-[family-name:var(--font-fraunces)] text-4xl text-teal-900">
          Studia
        </p>
        <h1 className="mt-3 text-xl text-stone-800">Créer un compte</h1>
        <p className="mt-1 text-sm text-stone-500">
          Inscription réservée aux administrateurs avec code d&apos;invitation.
        </p>

        <AuthForm action={signup} submitLabel="Créer le compte" showInvite />

        <p className="mt-6 text-sm text-stone-500">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-teal-800 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
