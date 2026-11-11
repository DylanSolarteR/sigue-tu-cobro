import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(), createStatement: vi.fn(), deleteStatement: vi.fn() }));
vi.mock("@/trpc/server", () => ({ api: {
  billing_statement_item: { mutations: { create: mocks.createItem, update: mocks.updateItem, delete: mocks.deleteItem } },
  billing_statement: { mutations: { create: mocks.createStatement, delete: mocks.deleteStatement } },
} }));

import { createPendingItem, updateBillingStatementItem, deleteBillingStatementItem } from "../../../actions/billing-statement.item.api";
import { createBillingStatement, deleteBillingstatement } from "../../../actions/billing-statement.api";

beforeEach(() => vi.resetAllMocks());

describe("acciones de ítems", () => {
  it.each([0, -1, 1.5, 2147483648])("rechaza el monto %s antes de consultar el servidor", async (amount) => {
    expect((await createPendingItem("c1", "Servicio", amount)).success).toBe(false);
    expect(mocks.createItem).not.toHaveBeenCalled();
  });
  it("envía el concepto validado y devuelve el identificador", async () => {
    mocks.createItem.mockResolvedValue("i1");
    expect(await createPendingItem("c1", " Servicio ", 250)).toMatchObject({ success: true, data: { id: "i1" } });
    expect(mocks.createItem).toHaveBeenCalledWith({ client_id: "c1", desc: "Servicio", amount: 250 });
  });
  it("informa el error al editar y al eliminar sin revelar la excepción", async () => {
    mocks.updateItem.mockRejectedValue(new Error("error interno"));
    mocks.deleteItem.mockRejectedValue(new Error("error interno"));
    { const result = await updateBillingStatementItem("i1", "Servicio", 100); expect(result.success).toBe(false); expect(result.message).not.toContain("error interno"); }
    { const result = await deleteBillingStatementItem("i1"); expect(result.success).toBe(false); expect(result.message).not.toContain("error interno"); }
  });
});

describe("acciones de cuentas", () => {
  const input = { client_id: "c1", creditor_id: "a1", payDate: "2026-01-01T00:00:00.000Z", item_ids: ["i1"] };
  it("requiere ítems seleccionados y una fecha válida", async () => {
    expect((await createBillingStatement({ ...input, item_ids: [] })).success).toBe(false);
    expect((await createBillingStatement({ ...input, payDate: "sin fecha" })).success).toBe(false);
    expect((await createBillingStatement({ ...input, payDate: "2026-02-29" })).success).toBe(false);
    expect(mocks.createStatement).not.toHaveBeenCalled();
  });
  it("acepta fechas civiles válidas", async () => {
    mocks.createStatement.mockResolvedValue("b1");
    expect((await createBillingStatement({ ...input, payDate: "2024-02-29" })).success).toBe(true);
  });
  it("devuelve el identificador creado y notifica fallos del servidor", async () => {
    mocks.createStatement.mockResolvedValueOnce("b1").mockRejectedValueOnce(new Error("servidor"));
    expect(await createBillingStatement(input)).toMatchObject({ success: true, data: { id: "b1" } });
    expect(await createBillingStatement(input)).toMatchObject({ success: false });
  });
  it("rechaza identificadores vacíos y maneja errores de eliminación", async () => {
    expect((await deleteBillingstatement("")).success).toBe(false);
    expect(mocks.deleteStatement).not.toHaveBeenCalled();
    mocks.deleteStatement.mockRejectedValue(new Error("servidor"));
    expect((await deleteBillingstatement("b1")).success).toBe(false);
  });
});
