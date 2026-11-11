// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ActorForm from "../../../components/dashboard/billing-statements/ActorForm";
const mocks = vi.hoisted(() => ({ pending: vi.fn(), create: vi.fn(), push: vi.fn() }));
vi.mock("@/actions/billing-statement.item.api", () => ({ getPendingItemsByClient: mocks.pending }));
vi.mock("@/actions/billing-statement.api", () => ({ createBillingStatement: mocks.create }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/components/DatePicker", () => ({ DatePicker: () => <span>Fecha elegida</span> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function selectOption(label: string, value: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label }));
  const option = screen.getAllByRole("option").find((item) => item.getAttribute("data-value") === value);
  if (!option) throw new Error(`Opción ${value} no encontrada`);
  fireEvent.click(option);
}

it("permite seleccionar ítems del cliente y abre la cuenta creada", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 50000 }] });
  mocks.create.mockResolvedValue({ success: true, data: { id: "b1" } });
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[{ ...actor, id: "a1", name: "Acreedor" }]} />);
  selectOption("Cliente", "c1");
  selectOption("Acreedor", "a1");
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de cobro" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ client_id: "c1", creditor_id: "a1", item_ids: ["i1"] })));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/dashboard/cuentas-cobro/editar/b1"));
});

it("mantiene deshabilitada la creación hasta seleccionar un ítem pendiente", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[{ ...actor, id: "a1", name: "Acreedor" }]} />);
  const submit = screen.getByRole<HTMLButtonElement>("button", { name: "Crear cuenta de cobro" });
  expect(submit.disabled).toBe(true);
  fireEvent.click(submit);
  expect(mocks.create).not.toHaveBeenCalled();
  selectOption("Cliente", "c1");
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  expect(submit.disabled).toBe(false);
  fireEvent.click(screen.getByLabelText(/Servicio/));
  expect(submit.disabled).toBe(true);
});

it("descarta la respuesta tardía del cliente anterior y su selección", async () => {
  let resolveFirst!: (value: unknown) => void;
  mocks.pending.mockImplementation((id: string) => id === "c1"
    ? new Promise((resolve) => { resolveFirst = resolve; })
    : Promise.resolve({ success: true, data: [{ id: "i2", desc: "Segundo", amount: 100 }] }));
  const base = { docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[{ ...base, id: "c1", name: "Cliente uno" }, { ...base, id: "c2", name: "Cliente dos" }]} creditorsList={[]} />);
  selectOption("Cliente", "c1");
  selectOption("Cliente", "c2");
  expect(await screen.findByLabelText(/Segundo/)).toBeTruthy();
  resolveFirst({ success: true, data: [{ id: "i1", desc: "Primero", amount: 100 }] });
  await waitFor(() => expect(screen.queryByText(/Primero/)).toBeNull());
  expect((screen.getByRole<HTMLButtonElement>("button", { name: "Crear cuenta de cobro" })).disabled).toBe(true);
});

it("muestra el error de creación y conserva la selección", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
  mocks.create.mockResolvedValue({ success: false, message: "El ítem ya fue agregado" });
  const base = { docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[{ ...base, id: "c1", name: "Cliente" }]} creditorsList={[{ ...base, id: "a1", name: "Acreedor" }]} />);
  selectOption("Cliente", "c1");
  selectOption("Acreedor", "a1");
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de cobro" }));
  expect((await screen.findByRole("alert")).textContent).toContain("El ítem ya fue agregado");
  expect((screen.getByLabelText<HTMLInputElement>(/Servicio/)).checked).toBe(true);
  expect(mocks.push).not.toHaveBeenCalled();
});

it("distingue una carga fallida de una lista sin ítems", async () => {
  mocks.pending.mockResolvedValue({ success: false, message: "No se pudieron cargar los ítems pendientes." });
  render(<ActorForm clientsList={[{ id: "c1", name: "Cliente", docType: "CC", docNumber: "1" }]} creditorsList={[]} />);
  selectOption("Cliente", "c1");
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText(/No hay ítems pendientes/)).toBeNull();
});

it("reserva espacio accesible mientras carga los conceptos del cliente", () => {
  mocks.pending.mockReturnValue(new Promise(() => { /* Mantener la carga pendiente para observar el skeleton. */ }));
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[]} />);
  selectOption("Cliente", "c1");
  expect(screen.getByRole("status", { name: "Cargando conceptos pendientes" }).querySelectorAll(".skeleton").length).toBeGreaterThan(0);
});

it("ordena cliente, acreedor y fecha antes de los ítems y el total", () => {
  const { container } = render(<ActorForm clientsList={[]} creditorsList={[]} />);
  const content = container.textContent ?? "";
  expect(content.indexOf("Cliente")).toBeLessThan(content.indexOf("Acreedor"));
  expect(content.indexOf("Acreedor")).toBeLessThan(content.indexOf("Fecha elegida"));
  expect(content.indexOf("Fecha elegida")).toBeLessThan(content.indexOf("Ítems pendientes"));
  expect(content.indexOf("Ítems pendientes")).toBeLessThan(content.indexOf("Total seleccionado"));
  for (const name of ["Cliente", "Acreedor"]) {
    const field = screen.getByLabelText(name);
    expect(field.className).toContain("bg-stc-field");
    expect(field.className).toContain("border-stc-border");
  }
});

it("actualiza el total y limpia la selección al cambiar de cliente", async () => {
  mocks.pending.mockImplementation((id: string) => Promise.resolve({ success: true, data: id === "c1" ? [{ id: "i1", desc: "Servicio", amount: 50000 }] : [{ id: "i2", desc: "Otro", amount: 100 }] }));
  const base = { docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[{ ...base, id: "c1", name: "Uno" }, { ...base, id: "c2", name: "Dos" }]} creditorsList={[]} />);
  selectOption("Cliente", "c1");
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  expect(screen.getByText(/Total seleccionado/).closest("p")?.textContent).toContain("50.000");
  selectOption("Cliente", "c2");
  expect(await screen.findByLabelText(/Otro/)).toBeTruthy();
  expect(screen.getByText(/Total seleccionado/).closest("p")?.textContent).toContain("$0");
  expect((screen.getByLabelText<HTMLInputElement>(/Otro/)).checked).toBe(false);
});


it("permite reintentar la carga fallida de ítems", async () => {
  mocks.pending.mockResolvedValueOnce({ success: false, message: "Error de carga" }).mockResolvedValueOnce({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 100 }] });
  render(<ActorForm clientsList={[{ id: "c1", name: "Cliente", docType: "CC", docNumber: "1" }]} creditorsList={[]} />);
  selectOption("Cliente", "c1");
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Reintentar carga" }));
  expect(await screen.findByLabelText(/Servicio/)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

it("conserva selección y total de conceptos entre páginas", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: Array.from({ length: 26 }, (_, index) => ({ id: `i${index}`, desc: `Concepto ${index + 1}`, amount: 100 })) });
  mocks.create.mockResolvedValue({ success: true, data: { id: "b1" } });
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[{ ...actor, id: "a1", name: "Acreedor" }]} />);
  selectOption("Cliente", "c1"); selectOption("Acreedor", "a1");
  fireEvent.click(await screen.findByLabelText(/^Concepto 1 /));
  expect(screen.queryByLabelText(/^Concepto 26 /)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Siguiente página de ítems" }));
  fireEvent.click(screen.getByLabelText(/^Concepto 26 /));
  expect(screen.getByText("$200")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Anterior página de ítems" }));
  expect((screen.getByLabelText(/^Concepto 1 /) as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de cobro" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ item_ids: ["i0", "i25"] })));
});
