"use client";

import { useActionState, useEffect, useRef } from "react";

type ActionResult = { error?: string; success?: boolean } | void;

export function ActionForm({
  action,
  children,
  className = "",
  successMessage = "Enregistré.",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (_prev: ActionResult, formData: FormData) => action(formData),
    undefined as ActionResult,
  );

  useEffect(() => {
    if (state && "success" in state && state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {state && "error" in state && state.error ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "success" in state && state.success ? (
        <p className="mt-3 text-sm font-medium text-teal-800" role="status">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
