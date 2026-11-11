// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ListBillingStatements from "@/components/dashboard/billing-statements/ListBillingStatements";

const mocks = vi.hoisted(() => ({ list: vi.fn(), items: vi.fn() }));
vi.mock("@/actions/billing-statement.api", () => ({ getBillingStatements: mocks.list, updateBillingStatementStatus: vi.fn(), deleteBillingstatement: vi.fn() }));
vi.mock("@/actions/billing-statement.item.api", () => ({ getBillingStatementItems: mocks.items }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@react-pdf/renderer", () => ({
  StyleSheet: { create: (styles: unknown) => styles }, Page: () => null, Text: () => null, View: () => null, Document: () => null,
  pdf: () => ({ toBlob: async () => new Blob(["pdf"]) }),
}));
vi.mock("@/components/dashboard/billing-statements/UpdateBillingStatementForm", () => ({
  default: ({ onUpdated, onPdfInvalidated }: { onUpdated: (value: unknown) => void; onPdfInvalidated: () => void }) => <button onClick={() => { const result = mocks.list.mock.results[0]; if (!result) throw new Error("Falta la cuenta de prueba"); onUpdated(result.value.valueData); onPdfInvalidated(); }}>Guardar edicion</button>,
}));

beforeEach(() => { vi.stubGlobal("URL", class extends URL { static createObjectURL = () => "blob:pdf"; static revokeObjectURL = vi.fn(); }); vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("recarga los conceptos del PDF despues de guardar en el acordeon", async () => {
  const actor = { name: "Ana", docType: "CC" as const, docNumber: "1" };
  const account = { id: "1", client_id: "c", creditor_id: "a", client: actor, creditor: actor, status: "pending", payDate: "2026-01-01", extraInfo: "", amount: 100 };
  const response = Promise.resolve({ success: true, message: "", data: [account] });
  Object.assign(response, { valueData: account });
  mocks.list.mockReturnValue(response);
  mocks.items.mockResolvedValue({ success: true, data: [] });
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Descargar PDF" }));
  await waitFor(() => expect(mocks.items).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Abrir cuenta de Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar edicion" }));
  fireEvent.click(await screen.findByRole("button", { name: "Descargar PDF" }));
  await waitFor(() => expect(mocks.items).toHaveBeenCalledTimes(2));
  expect(mocks.items).toHaveBeenLastCalledWith("1");
  expect(await screen.findByRole("button", { name: "Descargar PDF" })).toBeTruthy();
});

