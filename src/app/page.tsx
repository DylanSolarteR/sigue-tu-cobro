import { Button, Card } from "@/components/ui/";
import { SpotlightBorder } from "@/components/SpotlightBorder";
import { HydrateClient } from "@/trpc/server";
import Link from "next/link";
import Stonks from "@/media/svg/Stonks.svg";
import Image from "next/image";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="~px-10/56 flex h-full min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background to-[#0B1414] py-20 text-white">
        <section className="flex h-full w-full flex-col items-center justify-center gap-4">
          <section className="flex h-full w-full gap-2">
            <article className="order-1 mx-auto flex grow flex-col items-center justify-center gap-10 text-center sm:items-start sm:gap-16 sm:text-start">
              <div className="flex flex-col items-start justify-center space-y-4 text-balance sm:items-start">
                <h1 className="~text-4xl/7xl w-full font-bold">
                  Optimiza la creación de cuentas de cobro.
                </h1>
                <h2 className="~text-base/3xl w-full text-center brightness-75 sm:text-start">
                  Mantén un seguimiento continuo y gestiona tus clientes
                  fácilmente.
                </h2>
              </div>
            </article>
            <article className="order-2 hidden h-full w-full items-center justify-center self-center sm:flex">
              <SpotlightBorder
                className="my-10 flex h-full w-fit items-center justify-center sm:mx-auto"
                spotlightColor="#319678"
              >
                <Card className="flex h-full w-fit items-center justify-center border border-primary bg-primary px-16 py-14 shadow-inner">
                  <Image
                    src={Stonks}
                    alt="stonks image"
                    className="h-full w-auto"
                  />
                </Card>
              </SpotlightBorder>
            </article>
          </section>
          {/* TODO Cambiar ruta a register */}
          <section className="grid w-full grid-cols-1 content-center items-center justify-center gap-4 sm:grid-cols-2">
            <Link href="/dashboard" className="w-full sm:w-fit">
              <Button className="~text-xl/5xl ~p-6/14 w-full rounded-xl bg-secondary font-bold hover:bg-secondary hover:brightness-110">
                Regístrate Ahora
              </Button>
            </Link>
          </section>
        </section>
        {/* Bottom Light */}
        <div className="bg-gradient-radial visible absolute bottom-0 right-0 h-44 w-44 overflow-hidden rounded-full bg-[#319678] from-[#319678]/80 to-transparent blur-[25rem] sm:h-96 sm:w-96"></div>
      </main>
    </HydrateClient>
  );
}
