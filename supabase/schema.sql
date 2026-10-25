-- Student management schema (run once in Supabase SQL Editor)
-- RLS: anon denied; authenticated full access (single-tenant admin app)

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

-- Revoke broad grants from anon (defense in depth)
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
drop policy if exists "deny_anon_students" on public.students;

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
