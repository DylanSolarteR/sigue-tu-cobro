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

it("permite seleccionar ítems del cliente y abre la cuenta creada", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 50000 }] });
  mocks.create.mockResolvedValue({ success: true, data: { id: "b1" } });
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[{ ...actor, id: "a1", name: "Acreedor" }]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  fireEvent.change(screen.getByLabelText("Acreedor"), { target: { value: "a1" } });
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de cobro" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ client_id: "c1", creditor_id: "a1", item_ids: ["i1"] })));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/dashboard/cuentas-cobro/editar/b1"));
});

it("mantiene deshabilitada la creación hasta seleccionar un ítem pendiente", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
  const actor = { id: "c1", name: "Cliente", docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[actor]} creditorsList={[{ ...actor, id: "a1", name: "Acreedor" }]} />);
  const submit = screen.getByRole("button", { name: "Crear cuenta de cobro" }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  fireEvent.click(submit);
  expect(mocks.create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
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
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c2" } });
  expect(await screen.findByLabelText(/Segundo/)).toBeTruthy();
  resolveFirst({ success: true, data: [{ id: "i1", desc: "Primero", amount: 100 }] });
  await waitFor(() => expect(screen.queryByText(/Primero/)).toBeNull());
  expect((screen.getByRole("button", { name: "Crear cuenta de cobro" }) as HTMLButtonElement).disabled).toBe(true);
});

it("muestra el error de creación y conserva la selección", async () => {
  mocks.pending.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
  mocks.create.mockResolvedValue({ success: false, message: "El ítem ya fue agregado" });
  const base = { docType: "CC" as const, docNumber: "1" };
  render(<ActorForm clientsList={[{ ...base, id: "c1", name: "Cliente" }]} creditorsList={[{ ...base, id: "a1", name: "Acreedor" }]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  fireEvent.change(screen.getByLabelText("Acreedor"), { target: { value: "a1" } });
  fireEvent.click(await screen.findByLabelText(/Servicio/));
  fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de cobro" }));
  expect((await screen.findByRole("alert")).textContent).toContain("El ítem ya fue agregado");
  expect((screen.getByLabelText(/Servicio/) as HTMLInputElement).checked).toBe(true);
  expect(mocks.push).not.toHaveBeenCalled();
});

it("distingue una carga fallida de una lista sin ítems", async () => {
  mocks.pending.mockResolvedValue({ success: false, message: "No se pudieron cargar los ítems pendientes." });
  render(<ActorForm clientsList={[{ id: "c1", name: "Cliente", docType: "CC", docNumber: "1" }]} creditorsList={[]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText(/No hay ítems pendientes/)).toBeNull();
});
