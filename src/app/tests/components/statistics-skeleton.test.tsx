// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import StatisticsSkeleton from "@/components/dashboard/summary/StatisticsSkeleton";

afterEach(cleanup);
it("anuncia la carga y reserva el espacio de indicadores y gráficas", () => {
  const { container } = render(<StatisticsSkeleton />);
  expect(screen.getByRole("status", { name: "Cargando estadísticas" })).toBeTruthy();
  expect(container.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(6);
});
