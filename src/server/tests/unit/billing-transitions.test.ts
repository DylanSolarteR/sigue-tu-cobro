import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/api/trpc", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.create();
  return { createTRPCRouter: t.router, privateProcedure: t.procedure };
});

import { billingStatementRouter } from "../../api/routers/billing-statement";
import { billingStatementItemRouter } from "../../api/routers/billing-statement-item";

describe("operaciones transaccionales de cobro", () => {
  const owner = "owner";
  const item = { id: "i", ownerId: owner, client_id: "client", status: "pending", billing_statement_id: null, isActive: true, amount: 1000 };
  const input = { client_id: "client", creditor_id: "creditor", payDate: "2026-12-01", item_ids: ["i"] };

  it("genera cuenta por el total y vincula los ítems seleccionados", async () => {
    const values = vi.fn(async (_data: Record<string, unknown>) => undefined);
    const set = vi.fn((_data: Record<string, unknown>) => ({ where: async () => undefined }));
    const lock = vi.fn(async () => [item]);
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ where: async () => [{ id: "client", type: "client" }, { id: "creditor", type: "creditor" }] }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ for: lock }) }) }) });
    const tx = { select, insert: () => ({ values }), update: () => ({ set }) };
    const caller = billingStatementRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    const createdId = await caller.mutations.create(input);
    expect(lock).toHaveBeenCalledWith("update");
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ id: createdId, ownerId: owner, amount: 1000, status: "pending" }));
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ billing_statement_id: createdId, status: "added" }));
  });

  it("rechaza cliente o acreedor no disponible antes de insertar", async () => {
    const insert = vi.fn();
    const tx = { select: () => ({ from: () => ({ where: async () => [{ id: "client", type: "client" }] }) }), insert };
    const caller = billingStatementRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await expect(caller.mutations.create(input)).rejects.toThrow("Cliente o acreedor no disponible");
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([["paid", "paid"], ["pending", "added"]] as const)("estado %s sincroniza ítems como %s", async (status, itemStatus) => {
    const set = vi.fn((_data: Record<string, unknown>) => ({ where: async () => undefined }));
    const tx = { select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: "b" }] }) }) }), update: () => ({ set }) };
    const caller = billingStatementRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await caller.mutations.updateStatus({ id: "b", status });
    expect(set.mock.calls[0]?.[0]).toMatchObject({ status });
    expect(set.mock.calls[1]?.[0]).toMatchObject({ status: itemStatus });
  });

  it("al eliminar cuenta pendiente libera ítems y desactiva la cuenta", async () => {
    const set = vi.fn((_data: Record<string, unknown>) => ({ where: async () => undefined }));
    const tx = { select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: "b", status: "pending" }] }) }) }), update: () => ({ set }) };
    const caller = billingStatementRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await caller.mutations.delete({ id: "b" });
    expect(set.mock.calls[0]?.[0]).toMatchObject({ billing_statement_id: null, status: "pending" });
    expect(set.mock.calls[1]?.[0]).toMatchObject({ isActive: false });
  });

  it("impide eliminar una cuenta pagada", async () => {
    const update = vi.fn();
    const tx = { select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: "b", status: "paid" }] }) }) }), update };
    const caller = billingStatementRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await expect(caller.mutations.delete({ id: "b" })).rejects.toThrow("Reabre la cuenta");
    expect(update).not.toHaveBeenCalled();
  });

  it("no elimina un ítem asociado a una cuenta", async () => {
    const update = vi.fn();
    const tx = { select: () => ({ from: () => ({ where: () => ({ for: async () => [{ ...item, status: "added", billing_statement_id: "b" }] }) }) }), update };
    const caller = billingStatementItemRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementItemRouter.createCaller>[0]);
    await expect(caller.mutations.delete({ id: "i" })).rejects.toThrow("Solo se pueden eliminar ítems pendientes");
    expect(update).not.toHaveBeenCalled();
  });

  it("al editar un ítem agregado recalcula el total desde el servidor", async () => {
    const attached = { ...item, status: "added", billing_statement_id: "b" };
    const set = vi.fn((_data: Record<string, unknown>) => ({ where: async () => undefined }));
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ where: async () => [attached] }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ for: async () => [{ id: "b", status: "pending" }] }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ for: async () => [attached] }) }) })
      .mockReturnValueOnce({ from: () => ({ where: async () => [{ value: "2500" }] }) });
    const tx = { select, update: () => ({ set }) };
    const caller = billingStatementItemRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementItemRouter.createCaller>[0]);
    await caller.mutations.update({ id: "i", desc: "Nuevo servicio", amount: 2500 });
    expect(set.mock.calls[0]?.[0]).toMatchObject({ desc: "Nuevo servicio", amount: 2500 });
    expect(set.mock.calls[1]?.[0]).toMatchObject({ amount: 2500 });
  });

  it("no modifica un ítem que no pertenece al usuario", async () => {
    const update = vi.fn();
    const tx = { select: () => ({ from: () => ({ where: async () => [] }) }), update };
    const caller = billingStatementItemRouter.createCaller({ user: { userId: owner }, db: { transaction: (f: (value: typeof tx) => Promise<unknown>) => f(tx) } } as unknown as Parameters<typeof billingStatementItemRouter.createCaller>[0]);
    await expect(caller.mutations.update({ id: "ajeno", desc: "Servicio", amount: 1 })).rejects.toThrow("Ítem no encontrado");
    expect(update).not.toHaveBeenCalled();
  });
});
