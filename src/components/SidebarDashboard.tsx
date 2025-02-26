"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import {
  ChartNoAxesCombined,
  NotebookText,
  HandCoins,
  Handshake,
  Settings,
  CircleUser,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

function SidebarDashboard() {
  const path = usePathname();
  const { user } = useUser();
  return (
    <Sidebar variant="floating" collapsible="icon" className="rounded-full">
      <SidebarContent className="flex">
        <SidebarGroup className="flex flex-col items-center justify-start">
          <SidebarCard
            title={"Resumen"}
            active_href={path}
            Icon={ChartNoAxesCombined}
            href="/dashboard/resumen"
          />
          <SidebarCard
            title={"Cuentas de Cobro"}
            active_href={path}
            Icon={NotebookText}
            href="/dashboard/cuentas-cobro"
          />
          <SidebarCard
            title={"Clientes"}
            active_href={path}
            Icon={Handshake}
            href="/dashboard/clientes"
          />
          <SidebarCard
            title={"Acreedores"}
            active_href={path}
            Icon={HandCoins}
            href="/dashboard/acreedores"
          />
          <SidebarCard
            title={"Configuración"}
            active_href={path}
            Icon={Settings}
            href="/dashboard/config"
          />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-col items-center justify-start">
        <SidebarGroup className="flex flex-col items-center justify-start">
          <SidebarMenuButton
            className="flex h-10 flex-row items-center gap-4 rounded-lg py-10 hover:bg-muted hover:brightness-125"
            tooltip={"Perfil"}
          >
            <SignedIn>
              <UserButton
                afterSwitchSessionUrl="/dashboard/resume"
                fallback={<CircleUser className="min-h-8 min-w-8" />}
              />
              <span className="text-ellipsis text-lg">
                {user?.fullName ?? ""}
              </span>
            </SignedIn>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarCard(props: {
  title: string;
  href: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  active_href: string;
}) {
  const { title, href, Icon, active_href } = props;
  return (
    <SidebarGroup>
      <SidebarMenuButton
        className={`${active_href === href ? "bg-[#10473A] hover:bg-[#10473A]" : "hover:bg-transparent"} h-16 rounded-3xl text-xl`}
        asChild
        tooltip={title}
      >
        <Link
          href={href}
          className={`${active_href === href ? "" : "brightness-50"} flex flex-row items-center justify-start space-x-2 hover:brightness-100`}
        >
          <Icon
            className={`brightness min-h-4 min-w-4 md:min-h-8 md:min-w-8`}
          />
          <span className="text-wrap">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarGroup>
  );
}

export default SidebarDashboard;
