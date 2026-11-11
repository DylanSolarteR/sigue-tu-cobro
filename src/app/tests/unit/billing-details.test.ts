import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ account: vi.fn(), items: vi.fn() }));
vi.mock("@/trpc/server", () => ({ api: { billing_statement: { queries: { getOne: mocks.account } }, billing_statement_item: { queries: { getBillingStatementItems: mocks.items } } } }));
import { getBillingStatementDetails } from "@/actions/billing-statement.api";
beforeEach(() => vi.resetAllMocks());

it("valida la cuenta antes de solicitar sus detalles", async () => {
  expect((await getBillingStatementDetails("")).success).toBe(false);
  expect(mocks.account).not.toHaveBeenCalled();
  expect(mocks.items).not.toHaveBeenCalled();
});

it("inicia ambas consultas y devuelve una respuesta conjunta para el editor", async () => {
  let resolve!: (value: { id: string }) => void;
  mocks.account.mockReturnValue(new Promise((done) => { resolve = done; }));
  mocks.items.mockResolvedValue([{ id: "i1" }]);
  const result = getBillingStatementDetails("b1");
  expect(mocks.items).toHaveBeenCalledWith({ parentBillingStatementId: "b1" });
  resolve({ id: "b1" });
  expect(await result).toMatchObject({ success: true, data: { account: { id: "b1" }, items: [{ id: "i1" }] } });
});

it("no devuelve detalles incompletos si una consulta falla", async () => {
  mocks.account.mockResolvedValue({ id: "b1" });
  mocks.items.mockRejectedValue(new Error("Detalle interno"));
  expect(await getBillingStatementDetails("b1")).toMatchObject({ success: false, message: expect.not.stringContaining("Detalle interno") });
});
