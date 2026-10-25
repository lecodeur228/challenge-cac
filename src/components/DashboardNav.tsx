"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/dashboard/students", label: "Étudiants" },
  { href: "/dashboard/courses", label: "Cours" },
  { href: "/dashboard/enrollments", label: "Inscriptions" },
  { href: "/dashboard/grades", label: "Notes" },
  { href: "/dashboard/absences", label: "Absences" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur md:min-h-screen md:w-60 md:border-b-0 md:border-r md:bg-stone-50">
      <div className="flex flex-col gap-4 p-4 md:min-h-screen md:p-5">
        <div>
          <p className="font-[family-name:var(--font-fraunces)] text-2xl text-teal-900">
            Studia
          </p>
          <p className="text-sm text-stone-500">Gestion simple des étudiants</p>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:flex-col md:overflow-visible md:pb-0">
          {links.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-teal-800 text-white"
                    : "text-stone-700 hover:bg-stone-200/80"
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
            className="text-sm font-medium text-stone-500 hover:text-stone-800"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
