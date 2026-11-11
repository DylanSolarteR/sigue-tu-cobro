import CreateBillingStatementForm from "@/components/dashboard/billing-statements/CreateBillingStatementForm";
import Link from "next/link";
import { Suspense } from "react";
function CrearCuentaCobro() {
  return (
    <>
      <section className="flex w-full flex-col items-start justify-between gap-5 rounded-2xl bg-stc-surface p-4 sm:flex-row sm:items-end sm:p-6">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Crear cuenta de cobro</h1><p className="mt-2 text-stc-label text-stc-muted">Selecciona el cliente y los conceptos para preparar tu cuenta.</p></div>
        <Link href="/dashboard/cuentas-cobro" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-stc-border px-4 text-stc-label font-medium text-stc-text hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover sm:w-auto">Volver a cuentas de cobro</Link>
      </section>
      <section className="w-full min-w-0 rounded-2xl bg-stc-surface p-4 sm:p-6">
        <Suspense fallback={<div role="status" aria-label="Cargando formulario de cuenta" className="w-full max-w-4xl space-y-4"><div className="skeleton h-8 w-2/3" /><div className="skeleton h-12 w-full" /><div className="skeleton h-48 w-full" /></div>}>
          <CreateBillingStatementForm />
        </Suspense>
      </section>
    </>
  );
}
export default CrearCuentaCobro;
