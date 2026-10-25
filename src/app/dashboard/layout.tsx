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
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
