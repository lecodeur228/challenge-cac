export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  year: number;
  created_at: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  credits: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
  students?: Pick<Student, "id" | "first_name" | "last_name" | "email"> | null;
  courses?: Pick<Course, "id" | "code" | "title"> | null;
};

export type Grade = {
  id: string;
  enrollment_id: string;
  value: number;
  label: string;
  created_at: string;
  enrollments?: {
    id: string;
    students?: Pick<Student, "first_name" | "last_name"> | null;
    courses?: Pick<Course, "code" | "title"> | null;
  } | null;
};

export type Absence = {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  reason: string;
  created_at: string;
  students?: Pick<Student, "first_name" | "last_name"> | null;
  courses?: Pick<Course, "code" | "title"> | null;
};
