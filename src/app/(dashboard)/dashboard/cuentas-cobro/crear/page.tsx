import CreateBillingStatementForm from "@/components/dashboard/billing-statements/CreateBillingStatementForm";
import Link from "next/link";
import { Suspense } from "react";
function CrearCuentaCobro() {
  return (
    <>
      <section className="bg-stc-surface flex w-full flex-col items-start justify-between gap-5 rounded-2xl p-4 sm:flex-row sm:items-end sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Crear cuenta de cobro
          </h1>
          <p className="text-stc-label text-stc-muted mt-2">
            Selecciona el cliente y los conceptos para preparar tu cuenta.
          </p>
        </div>
        <Link
          href="/dashboard/cuentas-cobro"
          className="border-stc-border text-stc-label text-stc-text hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 font-medium sm:w-auto"
        >
          Volver a cuentas de cobro
        </Link>
      </section>
      <section className="bg-stc-surface w-full min-w-0 rounded-2xl p-4 sm:p-6">
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Cargando formulario de cuenta"
              className="w-full space-y-4"
            >
              <div className="skeleton rounded-xl h-8 w-2/3" />
              <div className="skeleton rounded-xl h-12 w-full" />
              <div className="skeleton rounded-xl h-48 w-full" />
            </div>
          }
        >
          <CreateBillingStatementForm />
        </Suspense>
      </section>
    </>
  );
}
export default CrearCuentaCobro;
