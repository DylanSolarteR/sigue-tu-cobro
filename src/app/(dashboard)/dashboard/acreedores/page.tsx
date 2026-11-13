import ListCreditors from "@/components/dashboard/creditors/ListCreditors";
import Link from "next/link";

export default function Acreedores() {
  return (
    <section className="w-full space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Acreedores</h1><p className="mt-2 text-base-content/70">Consulta y administra tus acreedores registrados.</p></div>
        <Link href="/dashboard/acreedores/crear" className="btn btn-primary min-h-11 w-full sm:w-auto">Crear nuevo acreedor</Link>
      </header>
      <ListCreditors />
    </section>
  );
}
