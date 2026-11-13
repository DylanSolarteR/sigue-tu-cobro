"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { ChartNoAxesCombined, CircleUser, Handshake, ListChecks, Menu, NotebookText, Settings, X } from "lucide-react";
import { useRef, useState } from "react";

const NAVIGATION = [
  { href: "/dashboard/resumen", title: "Resumen", icon: ChartNoAxesCombined },
  { href: "/dashboard/items", title: "Ítems", icon: ListChecks },
  { href: "/dashboard/cuentas-cobro", title: "Cuentas de cobro", icon: NotebookText },
  { href: "/dashboard/directorio", title: "Directorio", icon: Handshake },
  { href: "/dashboard/config", title: "Configuración", icon: Settings },
];

function NavigationLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAVIGATION.map(({ href, title, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`) || (href === "/dashboard/directorio" && (pathname.startsWith("/dashboard/clientes") || pathname.startsWith("/dashboard/acreedores")));
        return (
          <li key={href}>
            <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-stc-label font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75d4b6] ${active ? "bg-[#143d34] text-white" : "text-[#c1ccc8] hover:bg-[#172a25] hover:text-white"}`}>
              <Icon size={19} aria-hidden="true" /><span>{title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Profile() {
  return (
    <Show when="signed-in">
      <UserButton afterSwitchSessionUrl="/dashboard/resumen" fallback={<CircleUser aria-label="Perfil" />} userProfileMode="navigation" userProfileUrl="/dashboard/config" showName />
    </Show>
  );
}

export default function SidebarDashboard() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#263c35] bg-[#0d1d19] lg:flex">
        <Link href="/dashboard/resumen" className="px-7 pb-8 pt-8 text-lg font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-[#75d4b6]">SigueTuCobro<span className="text-[#75d4b6]">.</span></Link>
        <nav aria-label="Navegación principal" className="flex-1 px-3"><NavigationLinks pathname={pathname} /></nav>
        <div className="border-t border-[#263c35] px-5 py-5"><Profile /></div>
      </aside>

      <div className="border-b border-[#263c35] bg-[#0d1d19] lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard/resumen" className="text-base font-semibold text-white">SigueTuCobro<span className="text-[#75d4b6]">.</span></Link>
          <button ref={menuButton} type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="mobile-dashboard-navigation" onClick={() => setOpen((value) => !value)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-[#172a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75d4b6]">
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        {open && <nav id="mobile-dashboard-navigation" aria-label="Navegación móvil" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } }} className="border-t border-[#263c35] px-3 pb-5 pt-3"><NavigationLinks pathname={pathname} onNavigate={() => setOpen(false)} /><div className="px-4 pt-5"><Profile /></div></nav>}
      </div>
    </>
  );
}
