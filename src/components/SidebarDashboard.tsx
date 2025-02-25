"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  return (
    <Sidebar variant="floating" collapsible="icon" className="rounded-full">
      <SidebarHeader>
        <SidebarTrigger className="rounded-xl hover:bg-[#10473A]" />
      </SidebarHeader>
      <SidebarContent className="flex flex-col items-center justify-start">
        <SidebarCard
          title={"Resumen"}
          active_href={path}
          Icon={ChartNoAxesCombined}
          href="/dashboard"
        />
        <SidebarCard
          title={"Cuentas de Cobro"}
          active_href={path}
          Icon={NotebookText}
          href="/cuentas-cobro"
        />
        <SidebarCard
          title={"Clientes"}
          active_href={path}
          Icon={Handshake}
          href="/clientes"
        />
        <SidebarCard
          title={"Cobradores"}
          active_href={path}
          Icon={HandCoins}
          href="/cobradores"
        />
        <SidebarCard
          title={"Configuración"}
          active_href={path}
          Icon={Settings}
          href="/config"
        />
      </SidebarContent>
      <SidebarFooter className="flex flex-col items-center justify-start">
        <SidebarMenu className="flex">
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <CircleUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
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
      >
        <Link
          href={href}
          className={`${active_href === href ? "" : "brightness-50"} flex flex-row items-center justify-start space-x-2 hover:brightness-100`}
        >
          <Icon className="brightness min-h-4 min-w-4" />
          <span className="text-wrap">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarGroup>
  );
}

export default SidebarDashboard;
