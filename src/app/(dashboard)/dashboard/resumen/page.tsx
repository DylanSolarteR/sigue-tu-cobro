import { Button, SidebarTrigger } from "@/components/ui";
import Link from "next/link";
import Statistics from "./Statistics";
import { Suspense } from "react";
import Loading from "@/components/Loading";

function Dashboard() {
  return (
    <>
      <SidebarTrigger className="mr-4 mt-4 hidden scale-150 self-end rounded-lg hover:bg-[#10473A] md:flex" />
      <div className="flex flex-col items-center gap-2 overflow-y-auto px-4 py-4 md:justify-center md:px-0">
        <section className="grid h-full w-full grid-cols-1 items-center justify-center gap-3 md:grid md:h-[16rem] md:w-[70rem] md:max-w-[70rem] md:grid-flow-col md:grid-cols-4 md:items-center md:justify-between md:gap-3">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Loading />
              </div>
            }
          >
            <Statistics />
          </Suspense>
        </section>
        <section className="grid h-full max-h-[30rem] w-full items-center justify-center gap-3 md:grid-cols-4">
          <div className="h-full grow overflow-auto rounded-lg bg-muted md:col-span-3">
            <div className="px-8 py-4">
              <h2 className="mb-4 text-xl font-bold">Como empezar</h2>
              <ol className="list-inside list-decimal space-y-2 font-normal">
                <li>
                  <span className="font-semibold">
                    Crear Cliente y Acreedor
                  </span>{" "}
                  🧑‍💼
                  <p>Para crear un cliente y acreedor, sigue estos pasos:</p>
                  <ul className="ml-4 list-inside list-disc">
                    <li>
                      Accede al menú de{" "}
                      <span className="text-accent">clientes</span>.
                    </li>
                    <li>
                      Haz clic en{" "}
                      <span className="text-accent">"Nuevo Cliente"</span>.
                    </li>
                    <li>Rellena los datos del cliente y guarda.</li>
                    <li>Repite el proceso para crear un acreedor.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Crear Cuenta de Cobro</span>{" "}
                  📝
                  <p>Para crear una cuenta de cobro, sigue estos pasos:</p>
                  <ul className="ml-4 list-inside list-disc">
                    <li>
                      Accede al menú de{" "}
                      <span className="text-accent">cuentas de cobro</span>.
                    </li>
                    <li>
                      Haz clic en{" "}
                      <span className="text-accent">
                        "Nueva Cuenta de Cobro"
                      </span>
                      .
                    </li>
                    <li>Selecciona el cliente y acreedor.</li>
                    <li>Rellena los detalles de la cuenta y guarda.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Editar la cuenta de cobro
                  </span>{" "}
                  ✏️
                  <p>
                    Para editar una cuenta de cobro existente, sigue estos
                    pasos:
                  </p>
                  <ul className="ml-4 list-inside list-disc">
                    <li>
                      Accede al menú de{" "}
                      <span className="text-accent">cuentas de cobro</span>.
                    </li>
                    <li>Selecciona la cuenta que deseas editar.</li>
                    <li>
                      Haz clic en <span className="text-accent">"Editar"</span>.
                    </li>
                    <li>Realiza los cambios necesarios y guarda.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Descargar la cuenta de cobro (Opcional)
                  </span>{" "}
                  📥
                  <p>Para descargar una cuenta de cobro, sigue estos pasos:</p>
                  <ul className="ml-4 list-inside list-disc">
                    <li>
                      Accede al menú de{" "}
                      <span className="text-accent">cuentas de cobro</span>.
                    </li>
                    <li>
                      Haz clic en el icono de{" "}
                      <span className="text-accent">descarga</span> de la cuenta
                      que deseas descargar.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
          <div className="flex h-full w-[17rem] flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-secondary to-accent p-2">
            {/* <h2></h2> */}
            <p className="text-bold text-center text-2xl">
              Crea una nueva cuenta de cobro en unos pocos clicks
            </p>
            <Link
              href={"/dashboard/cuentas-cobro"}
              className="hover:drop-shadow-xl"
            >
              <Button size={"xl"}>Crear nueva</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default Dashboard;
