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
  expect(screen.queryByText("Tu trabajo, en orden")).toBeNull();
  const form = screen.getByRole("region", { name: "Autenticación" });
  const headline = screen.getByRole("heading", { name: /tus cuentas de cobro/i });
  expect(form.compareDocumentPosition(headline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
