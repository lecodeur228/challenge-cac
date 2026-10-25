-- Demo seed (run AFTER schema.sql in SQL Editor, as project owner)
-- Idempotent: skips if ada.lovelace@studia.test already exists

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

  raise notice 'Seed OK';
end $$;
