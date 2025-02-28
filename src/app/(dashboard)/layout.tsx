import Return from "@/components/dashboard/Return";
import SidebarDashboard from "@/components/SidebarDashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="max-w-screen h-full w-full">
      <div className="max-w-screen flex h-screen max-h-screen w-full items-start justify-center px-56 sm:px-2">
        <SidebarDashboard />
        <div className="flex h-full w-full flex-row items-center justify-center gap-6">
          <main className="wrap flex h-full max-h-[50rem] w-fit max-w-[70rem] flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center justify-between">
              <SidebarTrigger className="self-start rounded-lg hover:bg-[#10473A]" />
              <Return />
            </div>
            {children}
          </main>
        </div>
      </div>
    </main>
  );
}
