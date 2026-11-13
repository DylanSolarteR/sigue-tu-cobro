import ListClients from "@/components/dashboard/clients/ListClients";
import Link from "next/link";

export default function Clientes() {
  return (
    <section className="w-full space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Clientes</h1><p className="mt-2 text-base-content/70">Consulta y administra tus clientes registrados.</p></div>
        <Link href="/dashboard/clientes/crear" className="btn btn-primary min-h-11 w-full sm:w-auto">Crear nuevo cliente</Link>
      </header>
      <ListClients />
    </section>
  );
}
