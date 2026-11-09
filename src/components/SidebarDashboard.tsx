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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Show, UserButton } from "@clerk/nextjs";

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
      <SidebarContent className="flex">
        <SidebarGroup className="flex flex-col items-center justify-start">
          <SidebarTrigger className="mr-4 mt-4 scale-150 self-end rounded-lg hover:bg-[#10473A]" />

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
        <SidebarGroup className="flex flex-col items-center justify-center">
          <SidebarMenuButton
            className="flex h-10 flex-row items-center justify-start gap-4 rounded-lg py-10 selection:bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
            tooltip={"Perfil"}
          >
            <Show when="signed-in">
              <UserButton
                afterSwitchSessionUrl="/dashboard/resume"
                fallback={<CircleUser className="min-h-8 min-w-8" />}
                userProfileMode="navigation"
                userProfileUrl="/dashboard/config"
                showName={true}
                appearance={{
                  elements: {
                    avatarBox: {
                      order: 1,
                    },
                    userButtonOuterIdentifier: {
                      order: 2,
                      fontSize: "1.25rem",
                    },
                    userButtonTrigger: {
                      "&:focus": {
                        boxShadow: "none",
                      },
                    },
                  },
                }}
              />
            </Show>
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
        className={`${active_href.includes(href) ? "bg-[#10473A] hover:bg-[#10473A]" : "hover:bg-transparent"} h-16 rounded-3xl text-xl`}
        asChild
        tooltip={title}
      >
        <Link
          href={href}
          className={`${active_href.includes(href) ? "" : "brightness-50"} flex flex-row items-center justify-start space-x-2 hover:brightness-100`}
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
