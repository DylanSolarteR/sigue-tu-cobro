import SidebarDashboard from "@/components/SidebarDashboard";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-stc-bg lg:flex-row">
      <SidebarDashboard />
      <main id="contenido-principal" className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="flex w-full min-w-0 flex-col gap-stc-section">{children}</div>
      </main>
    </div>
  );
}
