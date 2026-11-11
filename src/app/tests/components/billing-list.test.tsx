// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ListBillingStatements from "@/components/dashboard/billing-statements/ListBillingStatements";
import { deleteBillingstatement, getBillingStatements, updateBillingStatementStatus } from "@/actions/billing-statement.api";

vi.mock("@/actions/billing-statement.api", () => ({
  getBillingStatements: vi.fn(), updateBillingStatementStatus: vi.fn(), deleteBillingstatement: vi.fn(),
}));
vi.mock("@/components/generatePDF", () => ({ default: () => <button>Descargar PDF</button> }));
vi.mock("@/components/dashboard/billing-statements/UpdateBillingStatementForm", () => ({ default: ({ id }: { id: string }) => <p>Editor {id}</p> }));
vi.mock("@/components/dashboard/DateField", () => ({ default: ({ id, label, value, onChange, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) => <label htmlFor={id}>{label}<input id={id} type="date" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></label> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

function selectOption(label: string, value: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label }));
  const option = screen.getAllByRole("option").find((item) => item.getAttribute("data-value") === value);
  if (!option) throw new Error(`Opción ${value} no encontrada`);
  fireEvent.click(option);
}

describe("listado de cuentas", () => {
  it("permite marcar una cuenta pagada desde su fila", async () => {
    vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [{ id: "1", client: { name: "Cliente", docType: "CC", docNumber: "12345" }, creditor: { name: "Acreedor", docType: "CC", docNumber: "12345" }, amount: 100, status: "pending", payDate: "2026-01-01", extraInfo: "", showItemAmount: true, client_id: "c", creditor_id: "a", createdAt: "" }] });
    vi.mocked(updateBillingStatementStatus).mockResolvedValueOnce({ success: true, message: "" });
    render(<ListBillingStatements />);
    fireEvent.click(await screen.findByRole("button", { name: "Marcar pagada" }));
    await waitFor(() => expect(updateBillingStatementStatus).toHaveBeenCalledWith("1", "paid"));
    expect(within(await screen.findByRole("list", { name: "Cuentas de cobro" })).getByText("Pagada")).toBeTruthy();
  });

  it("muestra un error cuando no puede cargar las cuentas", async () => {
    vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: false, message: "Error al cargar" });
    render(<ListBillingStatements />);
    expect((await screen.findByRole("alert")).textContent).toContain("Error al cargar");
  });
});

it("presenta cada cuenta como una entrada identificable con sus datos y acciones", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [{ id: "1", client: { name: "Cliente largo", docType: "CC", docNumber: "12345" }, creditor: { name: "Acreedor", docType: "CC", docNumber: "12345" }, amount: 100, status: "pending", payDate: "2026-01-01", extraInfo: "", showItemAmount: true, client_id: "c", creditor_id: "a", createdAt: "" }] });
  render(<ListBillingStatements />);
  const list = await screen.findByRole("list", { name: "Cuentas de cobro" });
  expect(list.textContent).toContain("Cliente largo");
  expect(list.textContent).toContain("Acreedor");
  expect(screen.getByRole("button", { name: "Abrir cuenta de Cliente largo" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /editar/i })).toBeNull();
});


const account = (id: string, name: string, status = "pending", payDate = "2026-01-01") => ({ id, client: { name, docType: "CC" as const, docNumber: "12345" }, creditor: { name: "Acreedor", docType: "CC" as const, docNumber: "12345" }, amount: 100, status, payDate, extraInfo: "", showItemAmount: true, client_id: id, creditor_id: "a", createdAt: "" });

it("abre y cierra el editor de la cuenta en contexto", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] });
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<ListBillingStatements />);
  const trigger = await screen.findByRole("button", { name: "Abrir cuenta de Ana" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });
  fireEvent.click(trigger);
  expect(screen.getByText("Editor 1")).toBeTruthy();
  expect((screen.getByLabelText<HTMLInputElement>("Fecha prevista de pago desde")).disabled).toBe(true);
  expect(screen.getByRole("button", { name: "Cerrar cuenta de Ana" }).getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Cerrar cuenta de Ana" }));
  expect(screen.queryByText("Editor 1")).toBeNull();
  vi.restoreAllMocks();
});

it("filtra por cliente, estado y fecha prevista de pago", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana", "pending", "2026-01-01"), account("2", "Ana", "paid", "2026-02-01"), account("3", "Bea", "pending", "2026-03-01")] });
  render(<ListBillingStatements />);
  await screen.findByText("Bea");
  fireEvent.change(screen.getByLabelText("Buscar cliente"), { target: { value: "ana" } });
  selectOption("Estado", "paid");
  fireEvent.change(screen.getByLabelText("Fecha prevista de pago desde"), { target: { value: "2026-02-01" } });
  expect(screen.queryByText("Bea")).toBeNull();
  expect(screen.getAllByText("Ana")).toHaveLength(1);
  expect(within(screen.getByRole("list", { name: "Cuentas de cobro" })).getByText("Pagada")).toBeTruthy();
});

it("procesa solo cuentas pendientes y conserva seleccionados los fallos parciales", async () => {
  vi.mocked(getBillingStatements).mockResolvedValue({ success: true, message: "", data: [account("1", "Ana"), account("2", "Bea"), account("3", "Cora", "paid")] });
  vi.mocked(updateBillingStatementStatus).mockResolvedValueOnce({ success: true, message: "" }).mockResolvedValueOnce({ success: false, message: "Error" });
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Seleccionar cuenta de Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar cuenta de Bea" }));
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar cuenta de Cora" }));
  fireEvent.click(screen.getByRole("button", { name: "Marcar seleccionadas como pagadas" }));
  expect(await screen.findByText(/1 actualizada.*1 fallida.*1 omitida/)).toBeTruthy();
  expect(updateBillingStatementStatus).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Bea" })).toBeTruthy();
});

it("confirma la eliminaci\u00f3n masiva y omite cuentas pagadas", async () => {
  vi.mocked(getBillingStatements).mockResolvedValue({ success: true, message: "", data: [account("1", "Ana"), account("2", "Bea", "paid")] });
  vi.mocked(deleteBillingstatement).mockResolvedValueOnce({ success: true, message: "Eliminada" });
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Seleccionar cuenta de Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar cuenta de Bea" }));
  fireEvent.click(screen.getByRole("button", { name: "Eliminar seleccionadas" }));
  expect(await screen.findByText(/1 eliminada.*0 fallidas.*1 omitida/)).toBeTruthy();
  expect(confirm).toHaveBeenCalled();
  expect(deleteBillingstatement).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Ana")).toBeNull();
  vi.restoreAllMocks();
});

it("reserva espacio accesible mientras carga las cuentas", () => {
  vi.mocked(getBillingStatements).mockReturnValueOnce(new Promise(() => { /* Mantiene la carga pendiente. */ }));
  render(<ListBillingStatements />);
  expect(screen.getByRole("status", { name: "Cargando cuentas" }).querySelectorAll(".skeleton").length).toBeGreaterThan(0);
});

it("conserva la seleccion al cambiar de pagina y filtrar", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: Array.from({ length: 11 }, (_, index) => account(String(index), `Cliente ${index}`)) });
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Seleccionar cuenta de Cliente 0" }));
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar cuenta de Cliente 10" }));
  fireEvent.change(screen.getByLabelText("Buscar cliente"), { target: { value: "Cliente 0" } });
  expect(screen.getByText("2 seleccionadas")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Cliente 0" })).toBeTruthy();
  expect(screen.getByText("1 de 1")).toBeTruthy();
});

it("no ejecuta acciones masivas si no puede verificar las cuentas", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] }).mockResolvedValueOnce({ success: false, message: "Error" });
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Seleccionar cuenta de Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Marcar seleccionadas como pagadas" }));
  expect(await screen.findByText(/No se pudieron verificar las cuentas/)).toBeTruthy();
  expect(updateBillingStatementStatus).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Ana" })).toBeTruthy();
});


it("selecciona con pulsacion tactil sostenida y cancela al desplazar", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] });
  render(<ListBillingStatements />);
  const row = (await screen.findByText("Ana")).closest("li")!;
  const pointer = (type: string, x: number) => {
    const event = new Event(type, { bubbles: true });
    Object.defineProperties(event, { pointerType: { value: "touch" }, clientX: { value: x }, clientY: { value: 0 } });
    fireEvent(row, event);
  };
  vi.useFakeTimers();
  pointer("pointerdown", 0);
  pointer("pointermove", 20);
  await act(async () => { vi.advanceTimersByTime(700); });
  expect(screen.getByRole("button", { name: "Seleccionar cuenta de Ana" })).toBeTruthy();
  pointer("pointerdown", 0);
  await act(async () => { vi.advanceTimersByTime(700); });
  pointer("pointerup", 0);
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Ana" })).toBeTruthy();
  vi.useRealTimers();
});

it("no elimina cuentas si se cancela la confirmacion masiva", async () => {
  vi.mocked(getBillingStatements).mockResolvedValue({ success: true, message: "", data: [account("1", "Ana")] });
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Seleccionar cuenta de Ana" }));
  fireEvent.click(screen.getByRole("button", { name: "Eliminar seleccionadas" }));
  await waitFor(() => expect(confirm).toHaveBeenCalled());
  expect(deleteBillingstatement).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Ana" })).toBeTruthy();
  vi.restoreAllMocks();
});

it("abre la fila al pulsarla sin interferir con sus controles", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] });
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByRole("button", { name: "Descargar PDF" }));
  expect(screen.queryByText("Editor 1")).toBeNull();
  fireEvent.click(screen.getByText("Ana"));
  expect(screen.getByText("Editor 1")).toBeTruthy();
});

it("protege la edicion abierta al intentar abrir otra fila", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana"), account("2", "Bea")] });
  const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
  render(<ListBillingStatements />);
  fireEvent.click(await screen.findByText("Ana"));
  fireEvent.click(screen.getByText("Bea"));
  expect(screen.getByText("Editor 1")).toBeTruthy();
  expect(screen.queryByText("Editor 2")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Abrir cuenta de Bea" }));
  expect(confirm).toHaveBeenCalledTimes(2);
  expect(screen.queryByText("Editor 1")).toBeNull();
  expect(screen.getByText("Editor 2")).toBeTruthy();
  vi.restoreAllMocks();
});

it("no abre la fila por el clic posterior a una pulsacion prolongada", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] });
  render(<ListBillingStatements />);
  const row = (await screen.findByText("Ana")).closest("li")!;
  const event = new Event("pointerdown", { bubbles: true });
  Object.defineProperties(event, { pointerType: { value: "touch" }, clientX: { value: 0 }, clientY: { value: 0 } });
  vi.useFakeTimers();
  fireEvent(row, event);
  await act(async () => { vi.advanceTimersByTime(700); });
  fireEvent.pointerUp(row);
  fireEvent.click(row);
  expect(screen.queryByText("Editor 1")).toBeNull();
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Ana" })).toBeTruthy();
  vi.useRealTimers();
});


it("selecciona al mantener pulsado el encabezado sin abrir el editor", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana")] });
  render(<ListBillingStatements />);
  const trigger = await screen.findByRole("button", { name: "Abrir cuenta de Ana" });
  const event = new Event("pointerdown", { bubbles: true });
  Object.defineProperties(event, { pointerType: { value: "touch" }, clientX: { value: 0 }, clientY: { value: 0 } });
  vi.useFakeTimers();
  fireEvent(trigger, event);
  await act(async () => { vi.advanceTimersByTime(700); });
  fireEvent.pointerUp(trigger);
  fireEvent.click(trigger);
  expect(screen.queryByText("Editor 1")).toBeNull();
  expect(screen.getByRole("button", { name: "Deseleccionar cuenta de Ana" }).getAttribute("aria-pressed")).toBe("true");
  vi.useRealTimers();
});

it("valida el intervalo de fechas y permite corregirlo", async () => {
  vi.mocked(getBillingStatements).mockResolvedValueOnce({ success: true, message: "", data: [account("1", "Ana", "pending", "2026-02-01")] });
  render(<ListBillingStatements />);
  await screen.findByText("Ana");
  fireEvent.change(screen.getByLabelText("Fecha prevista de pago desde"), { target: { value: "2026-03-01" } });
  fireEvent.change(screen.getByLabelText("Fecha prevista de pago hasta"), { target: { value: "2026-02-01" } });
  expect(screen.getByRole("alert").textContent).toContain("fecha inicial");
  fireEvent.change(screen.getByLabelText("Fecha prevista de pago desde"), { target: { value: "2026-01-01" } });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Ana")).toBeTruthy();
});
