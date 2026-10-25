/** Deterministic demo dataset for local + prod seeding. */

export const seedStudents = [
  {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada.lovelace@studia.test",
    program: "Informatique",
    year: 2,
  },
  {
    first_name: "Alan",
    last_name: "Turing",
    email: "alan.turing@studia.test",
    program: "Informatique",
    year: 3,
  },
  {
    first_name: "Marie",
    last_name: "Curie",
    email: "marie.curie@studia.test",
    program: "Physique",
    year: 2,
  },
  {
    first_name: "Grace",
    last_name: "Hopper",
    email: "grace.hopper@studia.test",
    program: "Informatique",
    year: 1,
  },
] as const;

export const seedCourses = [
  { code: "INFO101", title: "Algorithmique", credits: 4 },
  { code: "INFO201", title: "Bases de données", credits: 3 },
  { code: "PHY110", title: "Mécanique", credits: 3 },
  { code: "MATH120", title: "Algèbre linéaire", credits: 5 },
] as const;
