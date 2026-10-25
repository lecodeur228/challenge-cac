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
        <label className="block text-sm">
          <span className="text-stone-600">Code d&apos;invitation</span>
          <input
            name="invite_code"
            type="password"
            required
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none focus:border-teal-700"
          />
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="text-stone-600">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          maxLength={254}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none focus:border-teal-700"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={showInvite ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none focus:border-teal-700"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "…" : submitLabel}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
