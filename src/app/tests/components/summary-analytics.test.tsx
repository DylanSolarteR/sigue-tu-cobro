// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SummaryAnalytics from "@/components/dashboard/summary/SummaryAnalytics";

afterEach(() => { cleanup(); vi.useRealTimers(); });

it("ofrece filtros accesibles y actualiza la gráfica por cliente y período", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));
  render(<SummaryAnalytics statements={[
    { status: "paid", amount: 100, payDate: "2026-02-01", client_id: "a", client: { name: "Alfa" } },
    { status: "paid", amount: 200, payDate: "2026-02-02", client_id: "b", client: { name: "Beta" } },
    { status: "pending", amount: 400, payDate: "2026-02-03", client_id: "a", client: { name: "Alfa" } },
  ]} />);
  expect(screen.getByText(/no es la fecha efectiva de pago/i)).toBeTruthy();
  expect(screen.getByRole("heading", { name: /top 5 clientes por valor de cuentas pagadas/i })).toBeTruthy();
  expect(screen.getByText("Cuentas pagadas con fecha prevista dentro del período")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Cliente de la gráfica"), { target: { value: "a" } });
  expect(screen.getByLabelText("Datos de la gráfica").textContent).toContain("$500");
  expect(screen.getByLabelText("Ranking de clientes").textContent).toContain("$200");
  fireEvent.change(screen.getByLabelText("Período"), { target: { value: "custom" } });
  expect(screen.getByRole("button", { name: "Desde" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Hasta" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Desde" }));
  fireEvent.click(screen.getByRole("button", { name: "Limpiar fecha" }));
  expect(screen.getByRole("alert").textContent).toContain("rango de fechas válido");
  fireEvent.change(screen.getByLabelText("Período"), { target: { value: "3" } });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByLabelText("Datos de la gráfica").textContent).toContain("$500");
});

it("muestra solo los cinco clientes con mayor valor pagado", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));
  render(<SummaryAnalytics statements={Array.from({ length: 6 }, (_, index) => ({
    status: "paid", amount: (index + 1) * 100, payDate: "2026-02-01",
    client_id: String(index), client: { name: `Cliente ${index + 1}` },
  }))} />);
  const ranking = screen.getByLabelText("Ranking de clientes");
  expect(ranking.querySelectorAll("li")).toHaveLength(5);
  expect(ranking.textContent).toContain("Cliente 6");
  expect(ranking.textContent).not.toContain("Cliente 1");
});
