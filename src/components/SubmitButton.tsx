"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();

  const styles = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-700",
    danger:
      "bg-white text-red-700 border border-red-200 hover:bg-red-50 focus-visible:ring-red-600",
    ghost:
      "bg-transparent text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? "Patiente…" : children}
    </button>
  );
}
