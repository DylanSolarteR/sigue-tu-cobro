import ListBillingStatements from "@/components/dashboard/billing-statements/ListBillingStatements";
import Link from "next/link";

function Cuentas() {
  return (
    <>
      <section className="bg-base-200 flex w-full flex-col items-start justify-between gap-5 rounded-2xl p-4 sm:flex-row sm:items-end sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Cuentas de cobro
          </h1>
          <p className="text-base-content/70 mt-2 text-stc-label">
            Consulta tus cuentas y haz seguimiento a su estado.
          </p>
        </div>
        <Link
          href="/dashboard/cuentas-cobro/crear"
          className="btn btn-primary w-full rounded-xl sm:w-auto"
        >
          Crear nueva cuenta de cobro
        </Link>
      </section>
      <section className="bg-base-200 w-full rounded-2xl p-4 sm:p-6">
        <ListBillingStatements />
      </section>
    </>
  );
}

export default Cuentas;
