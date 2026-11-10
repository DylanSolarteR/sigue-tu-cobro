import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/api/trpc", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.create();
  return { createTRPCRouter: t.router, privateProcedure: t.procedure };
});

import { billingStatementItemRouter } from "../../api/routers/billing-statement-item";
import { billingStatementRouter } from "../../api/routers/billing-statement";

describe("validación de entradas de cuentas e ítems", () => {
  const itemCaller = billingStatementItemRouter.createCaller({} as Parameters<typeof billingStatementItemRouter.createCaller>[0]);
  const statementCaller = billingStatementRouter.createCaller({} as Parameters<typeof billingStatementRouter.createCaller>[0]);

  it.each([0, -1, 1.5, 2147483648])("rechaza el valor %s antes de acceder a datos", async (amount) => {
    await expect(itemCaller.mutations.create({ client_id: "c", desc: "Servicio", amount })).rejects.toThrow();
  });

  it("rechaza crear una cuenta sin ítems", async () => {
    await expect(statementCaller.mutations.create({ client_id: "c", creditor_id: "a", payDate: "2026-01-01", item_ids: [] })).rejects.toThrow();
  });

  it("rechaza fechas civiles inexistentes antes de acceder a datos", async () => {
    await expect(statementCaller.mutations.create({ client_id: "c", creditor_id: "a", payDate: "2026-02-29", item_ids: ["i"] })).rejects.toThrow();
  });

  it("no crea cuentas al seleccionar ítems de otro propietario", async () => {
    const insert = vi.fn();
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ where: async () => [{ id: "c", type: "client" }, { id: "a", type: "creditor" }] }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ for: async () => [{ id: "i", ownerId: "otro", client_id: "c", status: "pending", billing_statement_id: null, isActive: true, amount: 100 }] }) }) }) });
    const tx = { select, insert };
    const ctx = { user: { userId: "actual" }, db: { transaction: (fn: (value: typeof tx) => Promise<unknown>) => fn(tx) } };
    const caller = billingStatementRouter.createCaller(ctx as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await expect(caller.mutations.create({ client_id: "c", creditor_id: "a", payDate: "2026-01-01", item_ids: ["i"] })).rejects.toThrow("no están disponibles");
    expect(insert).not.toHaveBeenCalled();
  });

  it("impide editar un ítem mientras su cuenta está pagada", async () => {
    const update = vi.fn();
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ where: async () => [{ id: "i", billing_statement_id: "b" }] }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ for: async () => [{ id: "b", status: "paid" }] }) }) });
    const tx = { select, update };
    const ctx = { user: { userId: "actual" }, db: { transaction: (fn: (value: typeof tx) => Promise<unknown>) => fn(tx) } };
    const caller = billingStatementItemRouter.createCaller(ctx as unknown as Parameters<typeof billingStatementItemRouter.createCaller>[0]);
    await expect(caller.mutations.update({ id: "i", desc: "Servicio", amount: 100 })).rejects.toThrow("Reabre la cuenta");
    expect(update).not.toHaveBeenCalled();
  });

  it("al cambiar estado no sobrescribe fecha, información adicional ni visibilidad", async () => {
    const set = vi.fn((_values: Record<string, unknown>) => ({ where: async () => undefined }));
    const tx = {
      select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: "b", status: "pending", payDate: "2026-06-01", extraInfo: "actual", showItemAmount: false }] }) }) }),
      update: () => ({ set }),
    };
    const ctx = { user: { userId: "actual" }, db: { transaction: (fn: (value: typeof tx) => Promise<unknown>) => fn(tx) } };
    const caller = billingStatementRouter.createCaller(ctx as unknown as Parameters<typeof billingStatementRouter.createCaller>[0]);
    await caller.mutations.updateStatus({ id: "b", status: "paid" });
    expect(set).toHaveBeenCalledTimes(2);
    const values = set.mock.calls[0]?.[0];
    expect(values).toMatchObject({ status: "paid" });
    expect(values).not.toHaveProperty("payDate");
    expect(values).not.toHaveProperty("extraInfo");
    expect(values).not.toHaveProperty("showItemAmount");
  });
});
