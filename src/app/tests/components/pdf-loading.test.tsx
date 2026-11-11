// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DownloadPDFButton from "../../../components/generatePDF";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), blob: vi.fn(), downloads: [] as string[] }));
vi.mock("@/actions/billing-statement.item.api", () => ({ getBillingStatementItems: mocks.fetch }));
vi.mock("@react-pdf/renderer", () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Page: () => null, Text: () => null, View: () => null, Document: () => null,
  pdf: () => ({ toBlob: mocks.blob }),
}));
beforeEach(() => {
  vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:test-pdf"); static revokeObjectURL = vi.fn(); });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { mocks.downloads.push(this.download); });
  mocks.blob.mockResolvedValue(new Blob(["pdf"]));
});
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks(); vi.unstubAllGlobals(); mocks.downloads.length = 0; });
const actor = { name: "Cliente", docType: "CC" as const, docNumber: "1" };
const account = { id: "b1", client_id: "c1", creditor_id: "a1", client: actor, creditor: actor, status: "pending", payDate: "2026-01-01T00:00:00Z", extraInfo: "", amount: 50 };

it("prepara el PDF solo al solicitarlo y bloquea clics durante la carga", async () => {
  let resolve!: (result: { success: boolean; message: string }) => void;
  mocks.fetch.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<DownloadPDFButton data={account} />);
  expect(mocks.fetch).not.toHaveBeenCalled();
  expect(mocks.blob).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Descargar PDF" }));
  expect((screen.getByRole("button", { name: "Preparando PDF" }) as HTMLButtonElement).disabled).toBe(true);
  resolve({ success: false, message: "Error al cargar" });
  expect(await screen.findByText("No se pudo preparar el PDF.")).toBeTruthy();
  expect(mocks.downloads).toHaveLength(0);
  expect(mocks.blob).not.toHaveBeenCalled();
});

it("descarga el documento con el nombre y la fecha de la cuenta", async () => {
  mocks.fetch.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Trabajo", amount: 50 }] });
  render(<DownloadPDFButton data={account} />);
  fireEvent.click(screen.getByRole("button", { name: "Descargar PDF" }));
  await waitFor(() => expect(mocks.downloads).toHaveLength(1));
  expect(mocks.downloads[0]).toMatch(/^Cuenta de cobro Cliente .*\.pdf$/);
  expect(mocks.downloads[0]).toContain("31 de diciembre de 2025");
});

it("comunica un error de generación sin iniciar una descarga", async () => {
  mocks.blob.mockRejectedValue(new Error("PDF error"));
  mocks.fetch.mockResolvedValue({ success: true, data: [] });
  render(<DownloadPDFButton data={account} />);
  fireEvent.click(screen.getByRole("button", { name: "Descargar PDF" }));
  expect(await screen.findByText("No se pudo generar el PDF.")).toBeTruthy();
  expect(mocks.downloads).toHaveLength(0);
});
