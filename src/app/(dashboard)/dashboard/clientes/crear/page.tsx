import CreateClientForm from "@/components/dashboard/clients/CreateClientForm";
import Link from "next/link";

function CrearCliente() {
  return (
    <>
      <section className="w-full rounded-box bg-base-200 py-6">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Clientes</h1>
          <div className="flex w-full flex-row items-center justify-start gap-4 px-8">
            <Link href={"/dashboard/clientes"} className="btn btn-primary btn-sm sm:btn-md">Ver lista de clientes</Link>
          </div>
        </div>
      </section>
      <section className="flex overflow-auto w-full rounded-box bg-base-200 p-4 sm:p-6">
        <CreateClientForm />
      </section>
    </>
  );
}

export default CrearCliente;
