import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-stone-900">
        {title}
      </h1>
      <p className="mt-1.5 max-w-xl text-base text-stone-600">{description}</p>
    </header>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {title ? (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  min,
  max,
  step,
  children,
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  children?: ReactNode;
}) {
  const className =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      {children ? (
        <div className="mt-1">{children}</div>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={className}
        />
      )}
    </label>
  );
}

export function SelectField({
  label,
  name,
  required,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center">
      <p className="text-base text-stone-700">{message}</p>
      {hint ? <p className="mt-1 text-sm text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error" | "ok";
  children: ReactNode;
}) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-950",
    warn: "border-amber-300 bg-amber-50 text-amber-950",
    error: "border-red-300 bg-red-50 text-red-950",
    ok: "border-teal-300 bg-teal-50 text-teal-950",
  }[tone];

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-stone-50 text-stone-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
    </div>
  );
}
