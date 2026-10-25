import { describe, expect, it } from "vitest";
import {
  absenceSchema,
  authSchema,
  courseSchema,
  enrollmentSchema,
  gradeSchema,
  idSchema,
  studentSchema,
} from "./validation";

describe("studentSchema", () => {
  it("accepts valid student", () => {
    const r = studentSchema.safeParse({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      program: "Informatique",
      year: "2",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.year).toBe(2);
  });

  it("rejects invalid email", () => {
    expect(
      studentSchema.safeParse({
        first_name: "A",
        last_name: "B",
        email: "not-an-email",
        program: "X",
        year: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects oversized names", () => {
    expect(
      studentSchema.safeParse({
        first_name: "x".repeat(81),
        last_name: "B",
        email: "a@b.co",
        program: "X",
        year: 1,
      }).success,
    ).toBe(false);
  });
});

describe("courseSchema", () => {
  it("accepts alphanumeric code", () => {
    expect(
      courseSchema.safeParse({
        code: "INFO-101",
        title: "Algo",
        credits: 3,
      }).success,
    ).toBe(true);
  });

  it("rejects code with spaces/injection chars", () => {
    expect(
      courseSchema.safeParse({
        code: "INFO 101'; DROP",
        title: "Algo",
        credits: 3,
      }).success,
    ).toBe(false);
  });
});

describe("gradeSchema", () => {
  it("accepts note in range", () => {
    expect(
      gradeSchema.safeParse({
        enrollment_id: "11111111-1111-4111-8111-111111111111",
        value: 15.5,
        label: "Partiel",
      }).success,
    ).toBe(true);
  });

  it("rejects note > 20", () => {
    expect(
      gradeSchema.safeParse({
        enrollment_id: "11111111-1111-4111-8111-111111111111",
        value: 21,
        label: "Partiel",
      }).success,
    ).toBe(false);
  });
});

describe("enrollmentSchema / absenceSchema / idSchema", () => {
  it("requires uuids", () => {
    expect(
      enrollmentSchema.safeParse({
        student_id: "nope",
        course_id: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(false);
    expect(idSchema.safeParse("not-uuid").success).toBe(false);
    expect(
      idSchema.safeParse("11111111-1111-4111-8111-111111111111").success,
    ).toBe(true);
  });

  it("validates absence date format", () => {
    expect(
      absenceSchema.safeParse({
        student_id: "11111111-1111-4111-8111-111111111111",
        course_id: "11111111-1111-4111-8111-111111111111",
        date: "2026-10-25",
        reason: "Maladie",
      }).success,
    ).toBe(true);
    expect(
      absenceSchema.safeParse({
        student_id: "11111111-1111-4111-8111-111111111111",
        course_id: "11111111-1111-4111-8111-111111111111",
        date: "25/10/2026",
        reason: "",
      }).success,
    ).toBe(false);
  });
});

describe("authSchema", () => {
  it("requires min 8 char password", () => {
    expect(
      authSchema.safeParse({
        email: "admin@example.com",
        password: "short",
      }).success,
    ).toBe(false);
    expect(
      authSchema.safeParse({
        email: "admin@example.com",
        password: "longenough",
      }).success,
    ).toBe(true);
  });
});
