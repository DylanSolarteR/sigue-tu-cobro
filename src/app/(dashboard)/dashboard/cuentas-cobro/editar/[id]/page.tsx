import UpdateBillingStatmenteForm from "@/components/dashboard/billing-statements/UpdateBillingStatementForm";
import Link from "next/link";

async function UpdateBillingStatement(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return (
    <>
      <section className="flex w-full flex-col items-start justify-between gap-5 rounded-box bg-base-200 p-4 sm:flex-row sm:items-end sm:p-6">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Editar cuenta de cobro</h1><p className="mt-2 text-sm text-base-content/70">Revisa los conceptos y actualiza los datos de esta cuenta.</p></div>
        <Link href="/dashboard/cuentas-cobro" className="btn btn-outline w-full sm:w-auto">Volver a cuentas de cobro</Link>
      </section>
      <section className="w-full min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
        <UpdateBillingStatmenteForm id={id} />
      </section>
    </>
  );
}

export default UpdateBillingStatement;
