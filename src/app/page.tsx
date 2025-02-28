import { Button, Card } from "@/components/ui/";
import { SpotlightBorder } from "@/components/SpotlightBorder";
import { HydrateClient } from "@/trpc/server";
import Link from "next/link";
import Stonks from "@/media/svg/Stonks.svg?url";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default async function Home() {
  return (
    <HydrateClient>
      <Navbar />
      <div className="h-screen w-screen bg-gradient-to-br from-background to-[#0B1414]">
        <main className="relative mx-10 flex h-full min-h-screen flex-col items-center justify-center py-20 text-white sm:mx-56">
          <section className="flex h-full w-full justify-between gap-2 lg:justify-center">
            <article className="order-1 mx-auto flex grow flex-col items-center justify-center gap-10 text-center sm:items-start sm:gap-12 sm:text-start lg:mx-10">
              <div className="flex flex-col items-start justify-center space-y-4 text-balance sm:items-start">
                <h1 className="w-full text-4xl font-bold sm:text-7xl">
                  Optimiza la creación de cuentas de cobro.
                </h1>
                <h2 className="w-full text-center text-base brightness-75 sm:text-start sm:text-3xl">
                  Mantén un seguimiento continuo y gestiona tus clientes
                  fácilmente.
                </h2>
              </div>
              <Link href="/entrar" className="w-full sm:w-fit">
                <Button className="w-full rounded-xl bg-secondary p-6 text-xl font-bold hover:bg-secondary hover:brightness-110 sm:p-14 sm:text-5xl">
                  Inicia Ahora
                </Button>
              </Link>
            </article>
            <article className="order-2 hidden h-full w-full items-center justify-center self-center py-10 sm:flex md:py-20">
              <SpotlightBorder
                className="flex h-fit w-full items-center justify-center sm:mx-auto lg:w-fit"
                spotlightColor="#319678"
              >
                <Card className="flex h-fit w-full items-center justify-center border border-primary bg-primary px-16 py-14 shadow-inner lg:w-fit">
                  <Image
                    src={Stonks}
                    alt="stonks image"
                    className="h-full w-auto"
                  />
                </Card>
              </SpotlightBorder>
            </article>
          </section>
          {/* Bottom Light */}
          <div className="bg-gradient-radial visible absolute bottom-0 right-0 h-44 w-44 overflow-hidden rounded-full bg-[#319678] from-[#319678]/80 to-transparent blur-[25rem] sm:h-96 sm:w-96"></div>
        </main>
      </div>
    </HydrateClient>
  );
}
