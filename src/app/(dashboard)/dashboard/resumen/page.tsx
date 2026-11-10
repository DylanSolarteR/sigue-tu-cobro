import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, FilePlus2, ListChecks } from "lucide-react";
import Statistics from "./Statistics";
import StatisticsSkeleton from "@/components/dashboard/summary/StatisticsSkeleton";

export default function Dashboard() {
  return (
    <div className="w-full space-y-10 pb-8">
      <header className="flex flex-col gap-5 border-b border-[#263c35] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tu resumen</h1>
          <p className="text-stc-label leading-6 text-[#b9c9c2] sm:text-base">Organiza tus cobros y consulta cómo avanzan en un solo lugar.</p>
        </div>
        <Link href="/dashboard/cuentas-cobro/crear" className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#4fc69c] px-5 text-stc-label font-semibold text-[#092019] transition-colors hover:bg-[#72d9b2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4f2d3]">
          <FilePlus2 size={19} aria-hidden="true" /> Crear cuenta de cobro
        </Link>
      </header>

      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>

      <section aria-labelledby="next-steps-title" className="border-t border-[#263c35] pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="next-steps-title" className="text-xl font-semibold text-white">Prepara tu próximo cobro</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/items" className="group flex items-start gap-4 rounded-xl border border-[#263c35] bg-[#101f1a] p-5 transition-colors hover:border-[#4b806e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75d4b6]">
            <ListChecks size={21} className="mt-1 shrink-0 text-[#75d4b6]" aria-hidden="true" />
            <span className="min-w-0 flex-1"><span className="block font-medium text-white">Registra tus ítems pendientes</span><span className="mt-1 block text-stc-label leading-6 text-[#b9c9c2]">Agrega cada concepto y relaciónalo con un cliente.</span></span>
            <ArrowRight size={18} className="mt-1 shrink-0 text-[#b9c9c2] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link href="/dashboard/cuentas-cobro" className="group flex items-start gap-4 rounded-xl border border-[#263c35] bg-[#101f1a] p-5 transition-colors hover:border-[#4b806e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75d4b6]">
            <FilePlus2 size={21} className="mt-1 shrink-0 text-[#75d4b6]" aria-hidden="true" />
            <span className="min-w-0 flex-1"><span className="block font-medium text-white">Consulta tus cuentas</span><span className="mt-1 block text-stc-label leading-6 text-[#b9c9c2]">Revisa tus cobros, descarga el PDF o marca una cuenta como pagada.</span></span>
            <ArrowRight size={18} className="mt-1 shrink-0 text-[#b9c9c2] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
