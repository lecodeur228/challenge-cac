"use client";

import { useState } from "react";

const SETUP_SQL = `-- Studia: schéma + données de démo (à exécuter UNE fois dans Supabase SQL Editor)

create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null unique check (char_length(email) <= 254),
  program text not null default '' check (char_length(program) <= 120),
  year int not null default 1 check (year between 1 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 1 and 32),
  title text not null check (char_length(title) between 1 and 160),
  credits int not null default 3 check (credits between 1 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  value numeric(5,2) not null check (value >= 0 and value <= 20),
  label text not null default 'Examen' check (char_length(label) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.absences (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  date date not null default current_date,
  reason text not null default '' check (char_length(reason) <= 500),
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.grades enable row level security;
alter table public.absences enable row level security;

revoke all on table public.students from anon, public;
revoke all on table public.courses from anon, public;
revoke all on table public.enrollments from anon, public;
revoke all on table public.grades from anon, public;
revoke all on table public.absences from anon, public;

grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, update, delete on table public.enrollments to authenticated;
grant select, insert, update, delete on table public.grades to authenticated;
grant select, insert, update, delete on table public.absences to authenticated;

drop policy if exists "auth_all_students" on public.students;
drop policy if exists "auth_all_courses" on public.courses;
drop policy if exists "auth_all_enrollments" on public.enrollments;
drop policy if exists "auth_all_grades" on public.grades;
drop policy if exists "auth_all_absences" on public.absences;

create policy "auth_all_students" on public.students
  for all to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "auth_all_courses" on public.courses
  for all to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "auth_all_enrollments" on public.enrollments
  for all to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "auth_all_grades" on public.grades
  for all to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy "auth_all_absences" on public.absences
  for all to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

do $$
declare
  s_ada uuid; s_alan uuid; s_marie uuid; s_grace uuid;
  c_info101 uuid; c_info201 uuid; c_phy110 uuid; c_math120 uuid;
  e1 uuid; e2 uuid; e3 uuid; e4 uuid;
begin
  if exists (select 1 from public.students where email = 'ada.lovelace@studia.test') then
    raise notice 'Seed already present';
    return;
  end if;

  insert into public.students (first_name, last_name, email, program, year) values
    ('Ada', 'Lovelace', 'ada.lovelace@studia.test', 'Informatique', 2) returning id into s_ada;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Alan', 'Turing', 'alan.turing@studia.test', 'Informatique', 3) returning id into s_alan;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Marie', 'Curie', 'marie.curie@studia.test', 'Physique', 2) returning id into s_marie;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Grace', 'Hopper', 'grace.hopper@studia.test', 'Informatique', 1) returning id into s_grace;

  insert into public.courses (code, title, credits) values
    ('INFO101', 'Algorithmique', 4) returning id into c_info101;
  insert into public.courses (code, title, credits) values
    ('INFO201', 'Bases de données', 3) returning id into c_info201;
  insert into public.courses (code, title, credits) values
    ('PHY110', 'Mécanique', 3) returning id into c_phy110;
  insert into public.courses (code, title, credits) values
    ('MATH120', 'Algèbre linéaire', 5) returning id into c_math120;

  insert into public.enrollments (student_id, course_id) values (s_ada, c_info101) returning id into e1;
  insert into public.enrollments (student_id, course_id) values (s_ada, c_info201);
  insert into public.enrollments (student_id, course_id) values (s_alan, c_info101) returning id into e2;
  insert into public.enrollments (student_id, course_id) values (s_alan, c_math120);
  insert into public.enrollments (student_id, course_id) values (s_marie, c_phy110) returning id into e3;
  insert into public.enrollments (student_id, course_id) values (s_marie, c_math120);
  insert into public.enrollments (student_id, course_id) values (s_grace, c_info101) returning id into e4;

  insert into public.grades (enrollment_id, value, label) values
    (e1, 17.50, 'Partiel'), (e2, 19.00, 'Examen'), (e3, 16.00, 'TP'), (e4, 15.25, 'Contrôle');

  insert into public.absences (student_id, course_id, date, reason) values
    (s_marie, c_phy110, '2026-10-10', 'Maladie'),
    (s_grace, c_info101, '2026-10-15', 'Retard transport');
end $$;
`;

const SQL_EDITOR =
  "https://supabase.com/dashboard/project/mfnvfqkmnqduxjbdomgy/sql/new";

export function SchemaSetup({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copySql() {
    await navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-4 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
      <div>
        <h2 className="text-lg font-semibold">Installation base de données requise</h2>
        <p className="mt-1 text-sm leading-relaxed">
          Les tables Studia n&apos;existent pas encore sur Supabase. Ce n&apos;est
          pas un bug de l&apos;app : il faut exécuter le SQL une seule fois.
        </p>
      </div>

      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          Clique <strong>Copier le SQL</strong> ci-dessous
        </li>
        <li>
          Ouvre le{" "}
          <a
            href={SQL_EDITOR}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            SQL Editor Supabase
          </a>
        </li>
        <li>
          Colle (<kbd className="rounded bg-amber-100 px-1">Cmd+V</kbd>) puis{" "}
          <strong>Run</strong>
        </li>
        <li>
          Recharge cette page
        </li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copySql}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
        >
          {copied ? "SQL copié ✓" : "Copier le SQL"}
        </button>
        <a
          href={SQL_EDITOR}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-800 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
        >
          Ouvrir SQL Editor
        </a>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          J&apos;ai lancé le SQL — recharger
        </button>
      </div>

      {!compact ? (
        <details className="rounded-lg border border-amber-200 bg-white/70 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Voir le SQL
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all text-xs text-stone-700">
            {SETUP_SQL}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
