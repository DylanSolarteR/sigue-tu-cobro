"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ActorList } from "@/components/dashboard/actors/ActorList";

function DirectorySection({ kind, title }: { kind: "client" | "creditor"; title: string }) {
  const [open, setOpen] = useState(true);
  const panelId = `directorio-${kind}`;
  return (
    <section className="bg-stc-surface rounded-2xl p-4 sm:p-6">
      <h2>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className="focus-visible:border-stc-focus focus-visible:bg-stc-hover flex min-h-11 w-full items-center justify-between rounded-xl border border-transparent px-2 text-left text-xl font-semibold">
          {title}<ChevronDown aria-hidden="true" className={open ? "rotate-180" : ""} size={20} />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="mt-4"><ActorList kind={kind} cards /></div>
    </section>
  );
}

export default function Directorio() {
  return (
    <div className="w-full space-y-6">
      <header className="bg-stc-surface flex flex-col gap-5 rounded-2xl p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Directorio</h1><p className="text-stc-muted mt-2">Consulta y administra tus clientes y acreedores.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/clientes/crear" className="btn btn-primary min-h-11">Crear cliente</Link>
          <Link href="/dashboard/acreedores/crear" className="btn btn-outline min-h-11">Crear acreedor</Link>
        </div>
      </header>
      <DirectorySection kind="client" title="Clientes" />
      <DirectorySection kind="creditor" title="Acreedores" />
    </div>
  );
}
