import { describe, expect, it, vi } from "vitest";
import { SingleStoreDialect } from "drizzle-orm/singlestore-core";
import type { SQL } from "drizzle-orm";

vi.mock("@/server/api/trpc", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.create();
  return { createTRPCRouter: t.router, privateProcedure: t.procedure };
});

import { actorRouter } from "../../api/routers/actor";

describe("propiedad y validación de clientes y acreedores", () => {
  const owner = "usuario-actual";
  const valid = { id: "registro-1", name: "Nombre válido", docType: "CC" as const, docNumber: "12345" };
  const dialect = new SingleStoreDialect();

  it.each(["getClients", "getCreditors"] as const)("%s filtra por dueño, tipo y actividad", async (query) => {
    const where = vi.fn((_condition: SQL) => ({ orderBy: async () => [] }));
    const caller = actorRouter.createCaller({ user: { userId: owner }, db: { select: () => ({ from: () => ({ where }) }) } } as unknown as Parameters<typeof actorRouter.createCaller>[0]);
    await caller.queries[query]();
    const sql = dialect.sqlToQuery(where.mock.calls[0]![0]);
    expect(sql.sql).toContain("owner_id");
    expect(sql.params).toEqual(expect.arrayContaining([owner, query === "getClients" ? "client" : "creditor", true]));
  });

  it.each(["client", "creditor"] as const)("actualiza %s solo con su dueño y tipo", async (type) => {
    const where = vi.fn(async (_condition: SQL) => undefined);
    const caller = actorRouter.createCaller({ user: { userId: owner }, db: { update: () => ({ set: () => ({ where }) }) } } as unknown as Parameters<typeof actorRouter.createCaller>[0]);
    await caller.mutations[type].update(valid);
    const sql = dialect.sqlToQuery(where.mock.calls[0]![0]);
    expect(sql.sql).toContain("owner_id");
    expect(sql.params).toEqual(expect.arrayContaining([valid.id, type, owner]));
  });

  it.each(["client", "creditor"] as const)("rechaza nombre o documento inválido al actualizar %s", async (type) => {
    const update = vi.fn();
    const caller = actorRouter.createCaller({ user: { userId: owner }, db: { update } } as unknown as Parameters<typeof actorRouter.createCaller>[0]);
    await expect(caller.mutations[type].update({ ...valid, name: "ab" })).rejects.toThrow();
    await expect(caller.mutations[type].update({ ...valid, docNumber: "123" })).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  it.each(["client", "creditor"] as const)("desactiva %s solo con su dueño y tipo", async (type) => {
    const where = vi.fn(async (_condition: SQL) => undefined);
    const set = vi.fn((_data: Record<string, unknown>) => ({ where }));
    const caller = actorRouter.createCaller({ user: { userId: owner }, db: { update: () => ({ set }) } } as unknown as Parameters<typeof actorRouter.createCaller>[0]);
    await caller.mutations[type].delete({ id: valid.id });
    expect(set).toHaveBeenCalledWith({ isActive: false });
    const sql = dialect.sqlToQuery(where.mock.calls[0]![0]);
    expect(sql.params).toEqual(expect.arrayContaining([valid.id, type, owner]));
  });

  it.each(["client", "creditor"] as const)("crea %s con el propietario de sesión", async (type) => {
    const values = vi.fn((_data: Record<string, unknown>) => ({ $returningId: async () => [{ id: "new" }] }));
    const caller = actorRouter.createCaller({ user: { userId: owner }, db: { insert: () => ({ values }) } } as unknown as Parameters<typeof actorRouter.createCaller>[0]);
    await caller.mutations[type].create({ ...valid, type });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ ownerId: owner, type, name: valid.name }));
  });
});
