import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#0b1210] text-[#f2f8f4] lg:grid lg:grid-cols-2">
      <section className="order-1 flex items-start justify-center px-4 py-6 sm:px-8 lg:order-2 lg:min-h-screen lg:items-center lg:py-12" aria-label="Autenticación">
        <div className="w-full max-w-[27rem]">{children}</div>
      </section>
      <section className="order-2 relative flex flex-col justify-between bg-[#10241e] px-6 py-8 sm:px-12 lg:order-1 lg:min-h-screen lg:px-16 lg:py-12">
        <Link href="/" className="inline-flex w-fit items-center gap-3 text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#319678] text-white">S</span>
          SigueTuCobro
        </Link>
        <div className="max-w-lg py-12 lg:py-0">
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">Tus cuentas de cobro, en un solo lugar.</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#c0d4c9]">Registra tus conceptos, prepara tus cuentas y mantén a la vista lo que está pendiente.</p>
          <ul className="mt-8 space-y-3 text-sm text-[#d4e7dc]">
            <li className="flex items-center gap-3"><CheckCircle2 size={18} aria-hidden="true" className="text-[#80d1ad]" /> Organiza tus cobros por cliente</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} aria-hidden="true" className="text-[#80d1ad]" /> Consulta el estado de tus cuentas</li>
          </ul>
        </div>
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-[#c0d4c9] hover:text-white"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</Link>
      </section>
    </main>
  );
}
