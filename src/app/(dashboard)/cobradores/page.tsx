import { Button } from "@/components/ui";

function Cobradores() {
  return (
    <>
      <section className="rounded-lg bg-secondary py-6 md:h-[20%] md:max-h-[20%] md:w-full">
        <div className="flex h-full flex-col items-start justify-start gap-4">
          <h1 className="px-8 text-2xl text-white">Cobradores</h1>
          <div className="flex w-full flex-row items-center justify-center gap-4 px-8">
            <Button
              size={"xl"}
              variant={"outline"}
              className="bg-primary drop-shadow-lg hover:brightness-110"
            >
              Crear nuevo cliente
            </Button>
          </div>
        </div>
      </section>
      <section className="rounded-lg bg-muted md:h-[80%] md:max-h-[80%] md:w-full"></section>
    </>
  );
}

export default Cobradores;
