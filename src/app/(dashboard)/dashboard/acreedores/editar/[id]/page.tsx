import UpdateCreditorForm from "@/components/dashboard/creditors/UpdateCreditorForm";
import Link from "next/link";

export default async function ActorPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <section className="w-full space-y-6">
      <header className="space-y-4">
        <Link href="/dashboard/acreedores" className="btn btn-ghost min-h-11 -ml-4">Ver lista de acreedores</Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">Editar acreedor</h1>
      </header>
      <div className="rounded-box border border-base-300 bg-base-200 p-5 sm:p-8">
        <UpdateCreditorForm id={id} />
      </div>
    </section>
  );
}
