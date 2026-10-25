"use server";

import { revalidatePath } from "next/cache";
import { seedCourses, seedStudents } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";

export async function seedDemoData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié." };
  }

  // Probe schema
  const probe = await supabase.from("students").select("id").limit(1);
  if (probe.error || probe.status === 404) {
    return {
      error:
        "Tables absentes. Exécute d'abord supabase/schema.sql dans le SQL Editor.",
    };
  }

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return { error: "Des données existent déjà. Seed annulé (idempotent)." };
  }

  const { data: students, error: sErr } = await supabase
    .from("students")
    .insert([...seedStudents])
    .select("id, email");

  if (sErr || !students) {
    return { error: `Échec seed étudiants : ${sErr?.message ?? "inconnu"}` };
  }

  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .insert([...seedCourses])
    .select("id, code");

  if (cErr || !courses) {
    return { error: `Échec seed cours : ${cErr?.message ?? "inconnu"}` };
  }

  const byEmail = Object.fromEntries(students.map((s) => [s.email, s.id]));
  const byCode = Object.fromEntries(courses.map((c) => [c.code, c.id]));

  const enrollmentPairs = [
    ["ada.lovelace@studia.test", "INFO101"],
    ["ada.lovelace@studia.test", "INFO201"],
    ["alan.turing@studia.test", "INFO101"],
    ["alan.turing@studia.test", "MATH120"],
    ["marie.curie@studia.test", "PHY110"],
    ["marie.curie@studia.test", "MATH120"],
    ["grace.hopper@studia.test", "INFO101"],
  ] as const;

  const enrollmentsPayload = enrollmentPairs.map(([email, code]) => ({
    student_id: byEmail[email],
    course_id: byCode[code],
  }));

  const { data: enrollments, error: eErr } = await supabase
    .from("enrollments")
    .insert(enrollmentsPayload)
    .select("id, student_id, course_id");

  if (eErr || !enrollments) {
    return { error: `Échec seed inscriptions : ${eErr?.message ?? "inconnu"}` };
  }

  const findEnrollment = (email: string, code: string) =>
    enrollments.find(
      (e) => e.student_id === byEmail[email] && e.course_id === byCode[code],
    )?.id;

  const gradesPayload = [
    {
      enrollment_id: findEnrollment("ada.lovelace@studia.test", "INFO101"),
      value: 17.5,
      label: "Partiel",
    },
    {
      enrollment_id: findEnrollment("alan.turing@studia.test", "INFO101"),
      value: 19,
      label: "Examen",
    },
    {
      enrollment_id: findEnrollment("marie.curie@studia.test", "PHY110"),
      value: 16,
      label: "TP",
    },
    {
      enrollment_id: findEnrollment("grace.hopper@studia.test", "INFO101"),
      value: 15.25,
      label: "Contrôle",
    },
  ].filter((g) => g.enrollment_id);

  const { error: gErr } = await supabase.from("grades").insert(gradesPayload);
  if (gErr) {
    return { error: `Échec seed notes : ${gErr.message}` };
  }

  const absencesPayload = [
    {
      student_id: byEmail["marie.curie@studia.test"],
      course_id: byCode["PHY110"],
      date: "2026-10-10",
      reason: "Maladie",
    },
    {
      student_id: byEmail["grace.hopper@studia.test"],
      course_id: byCode["INFO101"],
      date: "2026-10-15",
      reason: "Retard transport",
    },
  ];

  const { error: aErr } = await supabase.from("absences").insert(absencesPayload);
  if (aErr) {
    return { error: `Échec seed absences : ${aErr.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/enrollments");
  revalidatePath("/dashboard/grades");
  revalidatePath("/dashboard/absences");

  return {
    success: true,
    message:
      "Données de démo chargées : 4 étudiants, 4 cours, inscriptions, notes, absences.",
  };
}
