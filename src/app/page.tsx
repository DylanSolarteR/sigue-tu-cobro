import { Button, Card } from "@/components/ui/";
import { SpotlightBorder } from "@/components/SpotlightBorder";
import { HydrateClient } from "@/trpc/server";
import Link from "next/link";
import Stonks from "@/media/images/Stonks.webp";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default async function Home() {
  return (
    <HydrateClient>
      <Navbar />
      <div className="h-screen w-screen bg-gradient-to-br from-background to-[#0B1414]">
        <main className="relative mx-10 flex h-full min-h-screen flex-col items-center justify-center py-20 text-white md:mx-56">
          <section className="flex h-full w-full justify-between gap-2 lg:justify-center">
            <article className="order-1 mx-auto flex grow flex-col items-center justify-center gap-10 text-center md:items-start md:gap-12 md:text-start lg:mx-10">
              <div className="flex flex-col items-start justify-center space-y-4 text-balance md:items-start">
                <h1 className="w-full text-4xl font-bold md:text-7xl">
                  Optimiza la creación de cuentas de cobro.
                </h1>
                <h2 className="w-full text-center text-base brightness-75 md:text-start md:text-3xl">
                  Mantén un seguimiento continuo y gestiona tus clientes
                  fácilmente.
                </h2>
              </div>
              <Link href="/entrar" className="hidden w-full md:w-fit 2xl:flex">
                <Button className="w-full rounded-xl bg-secondary p-6 text-xl font-bold hover:bg-secondary hover:brightness-110 md:p-14 md:text-5xl">
                  Inicia Ahora
                </Button>
              </Link>
              <p className="flex w-full text-center text-xl 2xl:hidden">
                Lamentablemente por el momento la aplicación no esta optimizada
                para dispositivos moviles 😅, ofrezco mis mas sinceras
                disculpas. Estan invitados a probarla en sus computadores de
                escritorio o portatiles. 😁
              </p>
            </article>
            <article className="order-2 hidden h-full w-full items-center justify-center self-center py-10 2xl:flex 2xl:py-20">
              <SpotlightBorder
                className="flex h-fit w-full items-center justify-center md:mx-auto 2xl:w-fit"
                spotlightColor="#319678"
              >
                <Card className="flex h-fit w-full items-center justify-center border border-primary bg-primary px-16 py-14 shadow-inner 2xl:w-fit">
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
          <div className="bg-gradient-radial visible absolute bottom-0 right-0 h-44 w-44 overflow-hidden rounded-full bg-[#319678] from-[#319678]/80 to-transparent blur-[25rem] md:h-96 md:w-96"></div>
        </main>
      </div>
    </HydrateClient>
  );
}
