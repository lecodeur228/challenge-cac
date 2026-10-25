import { z } from "zod";

const nonEmpty = (max: number) =>
  z.string().trim().min(1).max(max);

export const studentSchema = z.object({
  first_name: nonEmpty(80),
  last_name: nonEmpty(80),
  email: z.string().trim().email().max(254),
  program: nonEmpty(120),
  year: z.coerce.number().int().min(1).max(10),
});

export const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, "Code invalide"),
  title: nonEmpty(160),
  credits: z.coerce.number().int().min(1).max(30),
});

export const enrollmentSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
});

export const gradeSchema = z.object({
  enrollment_id: z.string().uuid(),
  value: z.coerce.number().min(0).max(20),
  label: nonEmpty(80),
});

export const absenceSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  reason: z.string().trim().max(500).default(""),
});

export const authSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export const idSchema = z.string().uuid();

export function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
