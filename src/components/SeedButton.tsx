"use client";

import { useState, useTransition } from "react";
import { seedDemoData } from "@/app/actions/seed";

export function SeedButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          setErr(null);
          startTransition(async () => {
            const result = await seedDemoData();
            if (result.error) setErr(result.error);
            if (result.message) setMsg(result.message);
            if (result.success) {
              // Soft refresh to show new counts
              window.location.reload();
            }
          });
        }}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-800 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 disabled:opacity-60"
      >
        {pending ? "Chargement…" : "Charger les données de démo"}
      </button>
      {err ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {err}
        </p>
      ) : null}
      {msg ? (
        <p className="text-sm font-medium text-teal-800" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
