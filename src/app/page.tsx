import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0D0D0D] to-[#0B1414] text-white">
        <div>
          <p>Hola</p>
        </div>
      </main>
    </HydrateClient>
  );
}
