-- One-shot setup for prod: schema + demo seed
-- Paste into Supabase SQL Editor and Run once.

-- === SCHEMA ===

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

-- === SEED ===
do $$
declare
  s_ada uuid;
  s_alan uuid;
  s_marie uuid;
  s_grace uuid;
  c_info101 uuid;
  c_info201 uuid;
  c_phy110 uuid;
  c_math120 uuid;
  e1 uuid;
  e2 uuid;
  e3 uuid;
  e4 uuid;
begin
  if exists (select 1 from public.students where email = 'ada.lovelace@studia.test') then
    raise notice 'Seed already present — skipped';
    return;
  end if;

  insert into public.students (first_name, last_name, email, program, year) values
    ('Ada', 'Lovelace', 'ada.lovelace@studia.test', 'Informatique', 2)
  returning id into s_ada;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Alan', 'Turing', 'alan.turing@studia.test', 'Informatique', 3)
  returning id into s_alan;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Marie', 'Curie', 'marie.curie@studia.test', 'Physique', 2)
  returning id into s_marie;
  insert into public.students (first_name, last_name, email, program, year) values
    ('Grace', 'Hopper', 'grace.hopper@studia.test', 'Informatique', 1)
  returning id into s_grace;

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
    (e1, 17.50, 'Partiel'),
    (e2, 19.00, 'Examen'),
    (e3, 16.00, 'TP'),
    (e4, 15.25, 'Contrôle');

  insert into public.absences (student_id, course_id, date, reason) values
    (s_marie, c_phy110, '2026-10-10', 'Maladie'),
    (s_grace, c_info101, '2026-10-15', 'Retard transport');
end $$;
