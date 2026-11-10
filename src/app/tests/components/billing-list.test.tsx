// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ListBillingStatements from "@/components/dashboard/billing-statements/ListBillingStatements";
import { getBillingStatements, updateBillingStatementStatus } from "@/actions/billing-statement.api";

vi.mock("@/actions/billing-statement.api", () => ({
  getBillingStatements: vi.fn(), updateBillingStatementStatus: vi.fn(), deleteBillingstatement: vi.fn(),
}));
vi.mock("@/components/generatePDF", () => ({ default: () => <button>Descargar PDF</button> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("listado de cuentas", () => {
  it("permite marcar una cuenta pagada desde su fila", async () => {
    vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [{ id: "1", client: { name: "Cliente", docType: "CC", docNumber: "12345" }, creditor: { name: "Acreedor", docType: "CC", docNumber: "12345" }, amount: 100, status: "pending", payDate: "2026-01-01", extraInfo: "", showItemAmount: true, client_id: "c", creditor_id: "a", createdAt: "" }] });
    vi.mocked(updateBillingStatementStatus).mockResolvedValueOnce({ success: true, message: "" });
    render(<ListBillingStatements />);
    fireEvent.click(await screen.findByRole("button", { name: "Marcar pagada" }));
    await waitFor(() => expect(updateBillingStatementStatus).toHaveBeenCalledWith("1", "paid"));
    expect(await screen.findByText("Pagada")).toBeTruthy();
  });

  it("muestra un error cuando no puede cargar las cuentas", async () => {
    vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: false, message: "Error al cargar" });
    render(<ListBillingStatements />);
    expect((await screen.findByRole("alert")).textContent).toContain("Error al cargar");
  });
});
