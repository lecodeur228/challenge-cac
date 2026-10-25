"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/students", label: "Étudiants" },
  { href: "/dashboard/courses", label: "Cours" },
  { href: "/dashboard/enrollments", label: "Inscriptions" },
  { href: "/dashboard/grades", label: "Notes" },
  { href: "/dashboard/absences", label: "Absences" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-6 border-b border-stone-200 bg-stone-50 p-5 md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
          Studia
        </p>
        <p className="mt-1 text-sm text-stone-500">Gestion étudiants</p>
      </div>
      <nav className="flex flex-wrap gap-1 md:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-teal-800 text-white"
                  : "text-stone-700 hover:bg-stone-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logout} className="md:mt-auto">
        <button
          type="submit"
          className="text-sm text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
        >
          Déconnexion
        </button>
      </form>
    </aside>
  );
}
