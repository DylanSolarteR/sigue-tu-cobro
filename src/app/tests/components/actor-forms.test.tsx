// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActorForm } from "@/components/dashboard/actors/ActorForm";
import CreateClientForm from "@/components/dashboard/clients/CreateClientForm";
import UpdateCreditorForm from "@/components/dashboard/creditors/UpdateCreditorForm";
import { createClient, getCreditorById } from "@/actions/actor.api";

vi.mock("@/actions/actor.api", () => ({
  createClient: vi.fn(),
  createCreditor: vi.fn(),
  updateClientById: vi.fn(),
  updateCreditorById: vi.fn(),
  getClientById: vi.fn(),
  getCreditorById: vi.fn(async () => ({ success: true, data: { id: "1", name: "Persona acreedora", docType: "NIT", docNumber: "123456", telephone: "3001234567" } })),
}));

afterEach(cleanup);

function selectOption(label: string, value: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label }));
  const option = screen.getAllByRole("option").find((item) => item.getAttribute("data-value") === value);
  if (!option) throw new Error(`Opción ${value} no encontrada`);
  fireEvent.click(option);
}

describe("formularios de clientes y acreedores", () => {
  it("reserva espacio con un skeleton accesible mientras carga la edición", () => {
    vi.mocked(getCreditorById).mockImplementationOnce(() => new Promise(() => { /* Mantiene la carga pendiente. */ }));
    render(<UpdateCreditorForm id="1" />);
    const status = screen.getByRole("status", { name: "Cargando información del acreedor" });
    expect(status.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it("permite seleccionar un tipo de documento mediante un control etiquetado", () => {
    render(<CreateClientForm />);
    const documentType = screen.getByRole("combobox", { name: "Tipo de documento" });
    expect(documentType.tagName).toBe("BUTTON");
    expect(documentType.closest("form")?.querySelector("[name=docType]")).toBeTruthy();
    expect(documentType.getAttribute("aria-required")).toBe("true");
    expect(screen.getByRole("textbox", { name: "Nombre completo" }).hasAttribute("required")).toBe(true);
  });

  it("agrupa los datos de identidad y contacto con etiquetas accesibles", () => {
    render(<CreateClientForm />);
    expect(screen.getByRole("group", { name: "Identificación" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Contacto" })).toBeTruthy();
  });

  it("muestra los datos del acreedor al editar y preserva su documento", async () => {
    render(<UpdateCreditorForm id="1" />);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Nombre completo" })).toBeTruthy());
    expect((screen.getByRole<HTMLInputElement>("textbox", { name: "Nombre completo" })).value).toBe("Persona acreedora");
    expect(screen.getByRole("combobox", { name: "Tipo de documento" }).closest("form")?.querySelector<HTMLInputElement>("[name=docType]")?.value).toBe("NIT");
    expect(screen.getByRole("button", { name: "Actualizar acreedor" })).toBeTruthy();
  });

  it("envía los datos seleccionados y muestra los errores del servidor", async () => {
    vi.mocked(createClient).mockResolvedValueOnce({ success: false, message: "Revisa los datos", errors: { docNumber: ["Documento inválido"] }, input: { name: "Ana Pérez", docType: "CC", docNumber: "12345" } });
    render(<CreateClientForm />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre completo" }), { target: { value: "Ana Pérez" } });
    selectOption("Tipo de documento", "CC");
    fireEvent.change(screen.getByRole("textbox", { name: "Número de documento" }), { target: { value: "12345" } });
    fireEvent.submit(screen.getByRole("button", { name: "Crear cliente" }).closest("form")!);
    await waitFor(() => expect(createClient).toHaveBeenCalled());
    const submitted = vi.mocked(createClient).mock.calls[0]?.[1];
    expect(submitted?.get("docType")).toBe("CC");
    expect(await screen.findByText("Documento inválido")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Número de documento" }).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("combobox", { name: "Tipo de documento" }).closest("form")?.querySelector<HTMLInputElement>("[name=docType]")?.value).toBe("CC");
    expect((screen.getByRole<HTMLInputElement>("textbox", { name: "Nombre completo" })).value).toBe("Ana Pérez");
  });
});

it("descarta el estado de validación del formulario anterior al editar otra entidad", async () => {
  vi.mocked(createClient).mockResolvedValueOnce({ success: false, message: "Dato anterior", input: { name: "Nombre anterior", docType: "CC", docNumber: "12345" } });
  const { rerender } = render(<ActorForm kind="client" />);
  fireEvent.submit(screen.getByRole("button", { name: "Crear cliente" }).closest("form")!);
  await screen.findByText("Dato anterior");
  rerender(<ActorForm kind="creditor" id="1" />);
  await waitFor(() => expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Nombre completo" }).value).toBe("Persona acreedora"));
  expect(screen.queryByText("Dato anterior")).toBeNull();
});
