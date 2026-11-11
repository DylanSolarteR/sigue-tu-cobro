// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ItemsManager from "../../../components/dashboard/billing-statements/ItemsManager";

const actions = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/actions/billing-statement.item.api", () => ({
  getPendingItemsByClient: actions.list,
  createPendingItem: actions.create,
  updateBillingStatementItem: actions.update,
  deleteBillingStatementItem: actions.remove,
}));

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  actions.list.mockResolvedValue({ success: true, message: "", data: [] });
  actions.create.mockResolvedValue({ success: true, message: "Ítem creado" });
  actions.update.mockResolvedValue({ success: true, message: "Ítem actualizado" });
  actions.remove.mockResolvedValue({ success: true, message: "Ítem eliminado" });
});

describe("gestión de ítems pendientes", () => {
  it("solicita los ítems del cliente seleccionado y crea un ítem válido", async () => {
    render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
    fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
    await waitFor(() => expect(actions.list).toHaveBeenCalledWith("c1"));
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Servicio" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "50000" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear ítem" }));
    await waitFor(() => expect(actions.create).toHaveBeenCalledWith("c1", "Servicio", 50000));
    expect(await screen.findByText("Ítem creado")).toBeTruthy();
  });
  it("permite editar y eliminar un ítem pendiente", async () => {
    actions.list.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
    render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
    fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
    fireEvent.click(await screen.findByRole("button", { name: /Servicio.*500/ }));
    fireEvent.change(await screen.findByLabelText("Descripción de Servicio"), { target: { value: "Servicio editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar ítem" }));
    await waitFor(() => expect(actions.update).toHaveBeenCalledWith("i1", "Servicio editado", 500));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar ítem" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    await waitFor(() => expect(actions.remove).toHaveBeenCalledWith("i1"));
  });
  it("conserva los datos si falla la creación y permite volver a intentar", async () => {
    actions.create.mockResolvedValue({ success: false, message: "No se pudo crear" });
    render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
    fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Servicio" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "50000" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear ítem" }));
    expect(await screen.findByText("No se pudo crear")).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>("Descripción").value).toBe("Servicio");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Crear ítem" }).disabled).toBe(false);
  });
  it("no elimina el ítem si se cancela la confirmación", async () => {
    actions.list.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 500 }] });
    render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
    fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
    fireEvent.click(await screen.findByRole("button", { name: /Servicio.*500/ }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar ítem" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(actions.remove).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Confirmar eliminación" })).toBeNull();
  });
  it("no presenta una carga fallida como una lista vacía", async () => {
    actions.list.mockResolvedValueOnce({ success: false, message: "No se pudieron cargar los ítems pendientes." }).mockResolvedValueOnce({ success: true, data: [] });
    render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
    fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
    expect(await screen.findByText("No se pudieron cargar los ítems pendientes.")).toBeTruthy();
    expect(screen.queryByText("Este cliente no tiene ítems pendientes.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar carga" }));
    expect(await screen.findByText("Este cliente no tiene ítems pendientes.")).toBeTruthy();
    expect(screen.queryByText("No se pudieron cargar los ítems pendientes.")).toBeNull();
  });
});

it("orienta al usuario antes de seleccionar un cliente", () => {
  render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
  expect(screen.getByRole("heading", { name: "Nuevo ítem" })).toBeTruthy();
  expect(screen.getByText("Selecciona un cliente para ver sus ítems pendientes.")).toBeTruthy();
});

it("reserva espacio accesible mientras carga los pendientes", () => {
  actions.list.mockReturnValue(new Promise(() => { /* La carga permanece pendiente durante la prueba. */ }));
  render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  expect(screen.getByRole("status", { name: "Cargando items pendientes" }).querySelectorAll(".skeleton").length).toBeGreaterThan(0);
});

it("formatea valores y rechaza letras al crear y editar", async () => {
  actions.list.mockResolvedValue({ success: true, data: [{ id: "i1", desc: "Servicio", amount: 50000 }] });
  render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  const createAmount = screen.getByLabelText<HTMLInputElement>("Valor");
  fireEvent.change(createAmount, { target: { value: "1234567" } });
  expect(createAmount.value).toBe("1.234.567");
  fireEvent.change(createAmount, { target: { value: "1.234.567a" } });
  expect(createAmount.value).toBe("1.234.567");
  expect(screen.getByRole("alert").textContent).toContain("únicamente números");
  fireEvent.click(await screen.findByRole("button", { name: /Servicio.*50.000/ }));
  const editAmount = await screen.findByLabelText<HTMLInputElement>("Valor de Servicio");
  expect(editAmount.value).toBe("50.000");
  fireEvent.change(editAmount, { target: { value: "75000" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar ítem" }));
  await waitFor(() => expect(actions.update).toHaveBeenCalledWith("i1", "Servicio", 75000));
});

it("ofrece una ruta para crear un cliente cuando no hay clientes", () => {
  render(<ItemsManager clients={[]} />);
  expect(screen.getByRole("link", { name: /crear cliente/i }).getAttribute("href")).toBe("/dashboard/clientes/crear");
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Crear ítem" }).disabled).toBe(true);
});


it("muestra el resumen del cliente y filas compactas expandibles", async () => {
  actions.list.mockResolvedValue({ success: true, data: [
    { id: "i1", desc: "Servicio", amount: 50000 },
    { id: "i2", desc: "Materiales", amount: 2500 },
  ] });
  render(<ItemsManager clients={[{ id: "c1", name: "Cliente A", docType: "CC", docNumber: "1" }]} />);
  fireEvent.change(screen.getByLabelText("Cliente"), { target: { value: "c1" } });
  const row = await screen.findByRole("button", { name: /Servicio.*50.000/ });
  expect(screen.getAllByText("Cliente A").length).toBeGreaterThan(1);
  expect(screen.getByText("2 ítems")).toBeTruthy();
  expect(screen.getByText(/52.500/)).toBeTruthy();
  expect(row.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByLabelText("Descripción de Servicio")).toBeNull();
  fireEvent.click(row);
  expect(row.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByLabelText("Descripción de Servicio")).toBeTruthy();
  fireEvent.click(row);
  expect(screen.queryByLabelText("Descripción de Servicio")).toBeNull();
});
