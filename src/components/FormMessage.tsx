"use client";

import { useActionState } from "react";

type ActionResult = { error?: string; success?: boolean } | void;

export function ActionForm({
  action,
  children,
  className = "",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionResult, formData: FormData) => action(formData),
    undefined as ActionResult,
  );

  return (
    <form action={formAction} className={className}>
      {children}
      {state && "error" in state && state.error ? (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}
