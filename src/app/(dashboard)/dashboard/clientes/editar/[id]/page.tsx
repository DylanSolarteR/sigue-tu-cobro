import UpdateClientForm from "@/components/dashboard/clients/UpdateClientForm";
import Link from "next/link";

async function UpdateClient(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
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
      <section className="flex items-center justify-center overflow-auto w-full rounded-box bg-base-200 p-4 sm:p-6">
        <UpdateClientForm id={id} />
      </section>
    </>
  );
}

export default UpdateClient;
