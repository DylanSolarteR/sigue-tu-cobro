// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import UpdateForm from "../../../components/dashboard/billing-statements/UpdateBillingStatementForm";
import type { getBillingStatementDetails } from "@/actions/billing-statement.api";
const mocks = vi.hoisted(() => ({ load: vi.fn<typeof getBillingStatementDetails>(), save: vi.fn(), edit: vi.fn() }));
vi.mock("@/actions/billing-statement.api", () => ({ getBillingStatementDetails: mocks.load, saveBillingStatement: mocks.save }));
vi.mock("@/actions/billing-statement.item.api", () => ({ updateBillingStatementItem: mocks.edit }));
vi.mock("@/components/DatePicker", () => ({ DatePicker: () => <span>Fecha</span> }));
const actor = { name: "Cliente", docType: "CC" as const, docNumber: "12345" };
const data = { account: { id: "b1", client_id: "c1", creditor_id: "a1", client: actor, creditor: actor, status: "paid", payDate: "2026-01-01", extraInfo: "", showItemAmount: true, amount: 500 }, items: [{ id: "i1", client_id: "c1", billing_statement_id: "b1", status: "paid" as const, desc: "Servicio", amount: 500 }] };
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it("muestra los ítems pagados bloqueados y no escribe datos al abrir", async () => {
  mocks.load.mockResolvedValue({ success: true, message: "", data });
  render(<UpdateForm id="b1" />);
  expect((await screen.findByLabelText<HTMLInputElement>("Descripción del ítem")).disabled).toBe(true);
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.edit).not.toHaveBeenCalled();
});
it("reserva espacio accesible mientras carga la cuenta", () => {
  mocks.load.mockReturnValue(new Promise(() => { /* Carga pendiente. */ }));
  render(<UpdateForm id="b1" />);
  expect(screen.getByRole("status", { name: "Cargando cuenta" }).querySelectorAll(".skeleton").length).toBeGreaterThan(0);
});
it("notifica al callback vigente sin volver a consultar al cambiar los callbacks", async () => {
  let resolve!: (value: Awaited<ReturnType<typeof getBillingStatementDetails>>) => void;
  mocks.load.mockReturnValue(new Promise((done) => { resolve = done; }));
  const previous = vi.fn(); const current = vi.fn();
  const { rerender } = render(<UpdateForm id="b1" onUpdated={previous} />);
  rerender(<UpdateForm id="b1" onUpdated={current} />);
  resolve({ success: true, message: "", data });
  await waitFor(() => expect(current).toHaveBeenCalledWith(data.account));
  expect(previous).not.toHaveBeenCalled();
  expect(mocks.load).toHaveBeenCalledTimes(1);
});
