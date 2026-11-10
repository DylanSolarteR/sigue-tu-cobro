// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Clientes from "@/app/(dashboard)/dashboard/clientes/page";

vi.mock("@/components/dashboard/clients/ListClients", () => ({ default: () => <div>Listado</div> }));

afterEach(cleanup);

it("ofrece un enlace de navegación sin controles anidados", async () => {
  render(await Clientes());
  const link = screen.getByRole("link", { name: "Crear nuevo cliente" });
  expect(link.getAttribute("href")).toBe("/dashboard/clientes/crear");
  expect(link.querySelector("button")).toBeNull();
});
