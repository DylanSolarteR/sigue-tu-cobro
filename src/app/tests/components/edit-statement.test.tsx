// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import UpdateForm from "../../../components/dashboard/billing-statements/UpdateBillingStatementForm";
const mocks = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn(), save: vi.fn(), edit: vi.fn() }));
vi.mock("@/actions/billing-statement.api", () => ({ getBillingStatement: mocks.get, saveBillingStatement: mocks.save }));
vi.mock("@/actions/billing-statement.item.api", () => ({ getBillingStatementItems: mocks.list, updateBillingStatementItem: mocks.edit }));
vi.mock("@/components/DatePicker", () => ({ DatePicker: () => <span>Fecha</span> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("muestra los ítems pagados bloqueados y no escribe datos al abrir", async () => {
  mocks.get.mockResolvedValue({ success: true, data: { id: "b1", status: "paid", payDate: "2026-01-01T00:00:00.000Z", extraInfo: "", showItemAmount: true, amount: 500 } });
  mocks.list.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
  render(<UpdateForm id="b1" />);
  const item = await screen.findByLabelText("Descripción del ítem");
  expect((item as HTMLInputElement).disabled).toBe(true);
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.edit).not.toHaveBeenCalled();
});

it("reserva espacio accesible mientras carga la cuenta", () => {
  mocks.get.mockReturnValue(new Promise(() => { /* Mantiene la carga pendiente. */ }));
  mocks.list.mockReturnValue(new Promise(() => { /* Mantiene la carga pendiente. */ }));
  render(<UpdateForm id="b1" />);
  expect(screen.getByRole("status", { name: "Cargando cuenta" }).querySelectorAll(".skeleton").length).toBeGreaterThan(0);
});
