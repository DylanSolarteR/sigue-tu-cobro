import CreateAcreedorForm from "@/components/dashboard/creditors/CreateCreditorForm";
import Link from "next/link";

function CrearAcreedor() {
  return (
    <>
      <section className="w-full rounded-box bg-base-200 py-6">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Acreedores</h1>
          <div className="flex w-full flex-row items-center justify-start gap-4 px-8">
            <Link href={"/dashboard/acreedores"} className="btn btn-primary btn-sm sm:btn-md">Ver lista de acreedores</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center overflow-auto w-full rounded-box bg-base-200 p-4 sm:p-6">
        <CreateAcreedorForm />
      </section>
    </>
  );
}

export default CrearAcreedor;
