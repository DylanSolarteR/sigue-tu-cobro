// @vitest-environment jsdom
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import DownloadPDFButton from "../../../components/generatePDF";

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), pdfError: null as string | null }));
vi.mock("@/actions/billing-statement.item.api", () => ({ getBillingStatementItems: mocks.fetch }));
vi.mock("@react-pdf/renderer", () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Page: () => null, Text: () => null, View: () => null, Document: () => null,
  PDFDownloadLink: ({ children, fileName, onClick }: { fileName: string; onClick: (event: React.MouseEvent<HTMLAnchorElement>, instance: { loading: boolean; error: string | null; url: string | null }) => void; children: (state: { loading: boolean; error: string | null }) => React.ReactNode }) => <a href="blob:test-pdf" download={fileName} onClick={(event) => onClick(event, { loading: false, error: mocks.pdfError, url: "blob:test-pdf" })}>{children({ loading: false, error: mocks.pdfError })}</a>,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.pdfError = null; });
const actor = { name: "Cliente", docType: "CC" as const, docNumber: "1" };
const account = { id: "b1", client_id: "c1", creditor_id: "a1", client: actor, creditor: actor, status: "pending", payDate: "2026-01-01T00:00:00Z", extraInfo: "", amount: 50 };

it("bloquea la descarga mientras carga y si falla la consulta", async () => {
  let resolve!: (result: { success: boolean; message: string }) => void;
  mocks.fetch.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<DownloadPDFButton data={account} />);
  expect((screen.getByRole("button", { name: "Cargando ítems para el PDF" }) as HTMLButtonElement).disabled).toBe(true);
  resolve({ success: false, message: "Error al cargar ítems" });
  expect(await screen.findByText("No se pudo preparar el PDF." )).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Descargar PDF" })).toBeNull();
});

it("ofrece la descarga con el nombre de la cuenta cuando los conceptos están listos", async () => {
  mocks.fetch.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Trabajo", amount: 50 }] });
  render(<DownloadPDFButton data={account} />);
  const button = await screen.findByRole("button", { name: "Descargar PDF" });
  expect((button as HTMLButtonElement).disabled).toBe(false);
  const link = button.closest("a");
  expect(link?.getAttribute("href")).toBe("blob:test-pdf");
  expect(link?.getAttribute("download")).toMatch(/^Cuenta de cobro Cliente .*\.pdf$/);
  expect(link?.getAttribute("download")).toContain("31 de diciembre de 2025");
});

it("impide la descarga si falla la generación del PDF", async () => {
  mocks.pdfError = "No se pudo generar";
  mocks.fetch.mockResolvedValue({ success: true, data: [] });
  render(<DownloadPDFButton data={account} />);
  expect(await screen.findByText("No se pudo generar el PDF.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Descargar PDF" })).toBeNull();
  const link = screen.getByRole("link");
  const click = createEvent.click(link);
  fireEvent(link, click);
  expect(click.defaultPrevented).toBe(true);
});
