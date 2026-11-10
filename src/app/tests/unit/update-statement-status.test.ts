import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateBillingStatementStatus } from "../../../actions/billing-statement.api";

const mocks = vi.hoisted(() => ({ updateStatus: vi.fn() }));
vi.mock("@/trpc/server", () => ({
  api: { billing_statement: { mutations: { updateStatus: mocks.updateStatus } } },
}));

beforeEach(() => { vi.clearAllMocks(); mocks.updateStatus.mockResolvedValue(undefined); });

describe("cambio rápido de estado", () => {
  it("envía únicamente el identificador y el estado", async () => {
    const result = await updateBillingStatementStatus("statement-1", "paid");
    expect(result.success).toBe(true);
    expect(mocks.updateStatus).toHaveBeenCalledWith({ id: "statement-1", status: "paid" });
  });
  it("rechaza identificadores vacíos sin realizar cambios", async () => {
    const result = await updateBillingStatementStatus("", "paid");
    expect(result.success).toBe(false);
    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });
});
