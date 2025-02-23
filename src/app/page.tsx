import { Button } from "@/components/ui/button";

import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0D0D0D] to-[#0B1414] text-white">
        <div>
          <Button
            variant={"ghost"}
            size="lg"
            onClick={async () => {
              "use server";
              console.log(
                await api.client.create({
                  name: "John Doe",
                  docType: "CC",
                  docNumber: "123456789",
                }),
              );
            }}
          >
            Crear Cliente
          </Button>
        </div>
      </main>
    </HydrateClient>
  );
}
