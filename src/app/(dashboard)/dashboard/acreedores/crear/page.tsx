import CreateAcreedorForm from "@/components/dashboard/creditors/CreateCreditorForm";
import { Button } from "@/components/ui";
import Link from "next/link";

function CrearAcreedor() {
  return (
    <>
      <section className="rounded-lg bg-secondary py-6 md:h-[20%] md:max-h-[20%] md:w-[70rem] md:max-w-full">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Acreedores</h1>
          <div className="flex w-full flex-row items-center justify-start gap-4 px-8">
            <Link href={"/dashboard/acreedores"}>
              <Button
                size={"xl"}
                variant={"outline"}
                className="bg-primary drop-shadow-lg hover:brightness-110"
              >
                Ver lista de acreedores
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="flex overflow-auto rounded-lg bg-muted md:h-[80%] md:max-h-[80%] md:w-[70rem] md:max-w-full">
        <CreateAcreedorForm />
      </section>
    </>
  );
}

export default CrearAcreedor;
