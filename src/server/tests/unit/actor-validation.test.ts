import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/api/trpc", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.create();
  return { createTRPCRouter: t.router, privateProcedure: t.procedure, publicProcedure: t.procedure };
});

import { actorRouter } from "../../api/routers/actor";

describe("validación del cliente en el servidor", () => {
  const valid = { name: "Ana Pérez", docType: "CC" as const, docNumber: "12345", type: "client" as const };
  // La validación debe rechazar la entrada antes de usar el contexto simulado.
  const caller = actorRouter.createCaller({} as Parameters<typeof actorRouter.createCaller>[0]);

  it.each([
    [{ ...valid, docType: "invalid" }, "Tipo de documento invalido."],
    [{ ...valid, type: "invalid" }, "Tipo de actor invalido."],
  ])("rechaza entradas inválidas antes de acceder a la base de datos", async (input, message) => {
    // La entrada inválida se fuerza deliberadamente para verificar la validación de red.
    await expect(caller.mutations.client.create(input as typeof valid)).rejects.toThrow(message);
  });
});
