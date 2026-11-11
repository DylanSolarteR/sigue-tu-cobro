import CreateClientForm from "@/components/dashboard/clients/CreateClientForm";
import Link from "next/link";

export default function ActorPage() {
  return (
    <section className="w-full space-y-6">
      <header className="space-y-4">
        <Link href="/dashboard/clientes" className="btn btn-ghost min-h-11 -ml-4">Ver lista de clientes</Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">Crear cliente</h1>
      </header>
      <div className="rounded-box border border-base-300 bg-base-200 p-5 sm:p-8">
        <CreateClientForm />
      </div>
    </section>
  );
}
