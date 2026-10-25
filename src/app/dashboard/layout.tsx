import { DashboardNav } from "@/components/DashboardNav";

export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
