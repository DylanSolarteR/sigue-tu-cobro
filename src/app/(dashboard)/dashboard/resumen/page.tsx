import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, FilePlus2, ListChecks, UsersRound } from "lucide-react";
import Statistics from "./Statistics";
import StatisticsSkeleton from "@/components/dashboard/summary/StatisticsSkeleton";

const steps = [
  { href: "/dashboard/directorio", title: "Completa tu directorio", description: "Registra clientes y acreedores.", Icon: UsersRound },
  { href: "/dashboard/items", title: "Registra tus ítems", description: "Añade los conceptos pendientes.", Icon: ListChecks },
  { href: "/dashboard/cuentas-cobro/crear", title: "Crea una cuenta de cobro", description: "Selecciona los ítems para generar tu cuenta.", Icon: FilePlus2 },
];

export default function Dashboard() {
  return <div className="w-full space-y-10 pb-8">
    <header className="flex flex-col gap-5 border-b border-[#263c35] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2"><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tu resumen</h1><p className="text-stc-label leading-6 text-[#b9c9c2] sm:text-base">Organiza tus cobros y consulta cómo avanzan en un solo lugar.</p></div>
      <Link href="/dashboard/cuentas-cobro/crear" className="btn btn-primary w-full rounded-xl sm:w-auto"><FilePlus2 size={19} aria-hidden="true" /> Crear cuenta de cobro</Link>
    </header>
    <section aria-label="Pasos para crear una cuenta" className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
      {steps.map(({ href, title, description, Icon }, index) => <div key={href} className="contents">
        {index > 0 && <span aria-hidden="true" className="flex justify-center text-stc-muted"><ArrowDown size={18} className="md:hidden" /><ArrowRight size={18} className="hidden md:block" /></span>}
        <Link href={href} className="flex min-w-0 flex-1 items-start gap-3 rounded-2xl border border-stc-border bg-stc-surface p-4 text-stc-text hover:border-stc-focus focus-visible:border-stc-focus focus-visible:outline-none">
          <Icon size={20} className="mt-0.5 shrink-0 text-stc-accent" aria-hidden="true" /><span><span className="block text-stc-label font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-stc-muted">{description}</span></span>
        </Link>
      </div>)}
    </section>
    <Suspense fallback={<StatisticsSkeleton />}><Statistics /></Suspense>
  </div>;
}
