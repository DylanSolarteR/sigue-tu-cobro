import SidebarDashboard from "@/components/SidebarDashboard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="max-w-screen h-full w-full">
      <div className="max-w-screen flex h-screen max-h-screen w-full items-start justify-center px-56 sm:px-2">
        <SidebarDashboard />
        <div className="flex h-full w-full flex-row items-center justify-center gap-6">
          <main className="flex h-screen w-screen max-w-[70rem] flex-col items-center justify-start gap-2">
            {children}
          </main>
        </div>
      </div>
    </main>
  );
}
