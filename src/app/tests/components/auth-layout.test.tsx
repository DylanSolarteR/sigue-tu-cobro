// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { AuthLayout } from "@/components/AuthLayout";

afterEach(cleanup);

it("presenta acceso claro a la portada y el contenido de autenticación", () => {
  render(<AuthLayout><div>Formulario de acceso</div></AuthLayout>);
  expect(screen.getByRole("link", { name: /siguetucobro/i }).getAttribute("href")).toBe("/");
  expect(screen.getByText("Formulario de acceso")).toBeTruthy();
  expect(screen.getByText(/tus cuentas de cobro/i)).toBeTruthy();
});
