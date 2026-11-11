import UpdateCreditorForm from "@/components/dashboard/creditors/UpdateCreditorForm";
import Link from "next/link";

export default async function ActorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <section className="w-full space-y-6">
      <header className="bg-stc-surface flex flex-col gap-5 rounded-2xl p-4 sm:flex-row-reverse sm:items-end sm:justify-between sm:p-6">
        <Link href="/dashboard/directorio" className="border-stc-border text-stc-text hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover inline-flex min-h-11 items-center justify-center rounded-xl border px-4 font-medium">Volver al directorio</Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">Editar acreedor</h1>
      </header>
      <div className="bg-stc-surface rounded-2xl p-4 sm:p-6">
        <UpdateCreditorForm id={id} />
      </div>
    </section>
  );
}
