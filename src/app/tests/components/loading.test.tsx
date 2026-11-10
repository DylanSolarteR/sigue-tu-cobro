// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Loading from "@/components/Loading";

afterEach(cleanup);

it("muestra un estado de carga accesible con espacio para el formulario", () => {
  const { container } = render(<Loading />);
  const status = screen.getByRole("status", { name: /cargando/i });
  expect(status.className).toContain("max-w-4xl");
  expect(status.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(4);
  expect(container.querySelector("svg, .animate-spin")).toBeNull();
});
