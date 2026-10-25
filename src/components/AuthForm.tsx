"use client";

import { useState, useTransition } from "react";

export function AuthForm({
  action,
  submitLabel,
  showInvite = false,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
  showInvite?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

  return (
    <form
      className="mt-8 space-y-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await action(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      {showInvite ? (
        <label className="block text-sm font-medium text-stone-700">
          Code d&apos;invitation <span className="text-red-600">*</span>
          <input
            name="invite_code"
            type="password"
            required
            autoComplete="off"
            placeholder="Fourni pour le challenge"
            className={inputClass}
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-stone-700">
        Email <span className="text-red-600">*</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          maxLength={254}
          placeholder="toi@ecole.fr"
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Mot de passe <span className="text-red-600">*</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={showInvite ? "new-password" : "current-password"}
          placeholder="8 caractères minimum"
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Patiente…" : submitLabel}
      </button>
      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
