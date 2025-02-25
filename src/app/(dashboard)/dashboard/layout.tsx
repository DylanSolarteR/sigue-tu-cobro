import SidebarDashboard from "@/components/SidebarDashboard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="max-w-screen h-full w-full">
      <div className="flex h-screen max-h-full w-full max-w-full items-start justify-center px-56 sm:px-2">
        <SidebarDashboard />

        <div className="flex h-full w-full flex-row items-center justify-center gap-6">
          {children}
        </div>
      </div>
    </main>
  );
}
