import CreateBillingStatementForm from "@/components/dashboard/billing-statements/CreateBillingStatementForm";
import Loading from "@/components/Loading";
import Link from "next/link";
import { Suspense } from "react";
function CrearCuentaCobro() {
  return (
    <>
      <section className="w-full rounded-box bg-base-200 py-6">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Cuentas de cobro</h1>
          <div className="flex w-full flex-row items-center justify-start gap-4 px-8">
            <Link href={"/dashboard/cuentas-cobro"} className="btn btn-primary btn-sm sm:btn-md">Ver lista de cuentas de cobro</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center overflow-auto w-full rounded-box bg-base-200 p-4 sm:p-6">
        <Suspense fallback={<Loading />}>
          <CreateBillingStatementForm />
        </Suspense>
      </section>
    </>
  );
}
export default CrearCuentaCobro;
