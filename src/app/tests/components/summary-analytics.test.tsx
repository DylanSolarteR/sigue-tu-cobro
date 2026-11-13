// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SummaryAnalytics from "@/components/dashboard/summary/SummaryAnalytics";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function selectOption(label: string, value: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label }));
  const option = screen.getAllByRole("option").find((item) => item.getAttribute("data-value") === value);
  if (!option) throw new Error(`Opción ${value} no encontrada`);
  fireEvent.click(option);
}

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
  selectOption("Cliente de la gráfica", "a");
  expect(screen.getByLabelText("Datos de la gráfica").textContent).toContain("$500");
  expect(screen.getByLabelText("Ranking de clientes").textContent).toContain("$200");
  selectOption("Período", "custom");
  expect(screen.getByRole("button", { name: "Desde" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Hasta" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Desde" }));
  fireEvent.click(screen.getByRole("button", { name: "Limpiar fecha" }));
  expect(screen.getByRole("alert").textContent).toContain("rango de fechas válido");
  selectOption("Período", "3");
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

it("permite consultar cada nodo con puntero, toque y teclado sin bloquear la gráfica", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));
  render(<SummaryAnalytics statements={[{ status: "paid", amount: 500, payDate: "2026-02-01", client_id: "a", client: { name: "Alfa" } }]} />);

  expect(screen.queryByText("Ver valores de la gráfica")).toBeNull();
  const datos = screen.getByLabelText("Datos de la gráfica");
  expect(datos.className).toContain("sr-only");
  expect(datos.textContent).toContain("$500");
  const nodo = screen.getByRole("button", { name: /feb.*2026.*\$500/i });
  fireEvent.mouseEnter(nodo);
  expect(screen.getByTestId("chart-value").textContent).toContain("$500");
  fireEvent.mouseLeave(nodo);
  expect(screen.queryByTestId("chart-value")).toBeNull();
  fireEvent.click(nodo);
  expect(screen.getByTestId("chart-value").textContent).toContain("$500");
  fireEvent.focus(nodo);
  expect(screen.getByTestId("chart-value").textContent).toContain("$500");
  fireEvent.keyDown(nodo, { key: "Escape" });
  expect(screen.queryByTestId("chart-value")).toBeNull();
  fireEvent.blur(nodo);
  fireEvent.focus(nodo);
  expect(screen.getByTestId("chart-value").textContent).toContain("$500");
  selectOption("Cliente de la gráfica", "a");
  expect(screen.getByTestId("chart-value").textContent).toContain("$500");
  selectOption("Período", "3");
  expect(screen.getByLabelText("Datos de la gráfica").querySelectorAll("li")).toHaveLength(3);
});

it("ubica el valor junto a los nodos extremos dentro de la zona visible desplazada", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));
  render(<SummaryAnalytics statements={[]} />);
  const datos = screen.getByLabelText("Datos de la gráfica");
  const meses = Array.from(datos.querySelectorAll("li"));
  const primero = screen.getByRole("button", { name: new RegExp(meses[0]!.textContent!.split(":")[0]!, "i") });
  const ultimo = screen.getByRole("button", { name: /feb.*2026/i });
  const zona = screen.getByTestId("chart-scroll");
  Object.defineProperty(zona, "clientWidth", { configurable: true, value: 200 });

  fireEvent.mouseEnter(primero);
  let valor = screen.getByTestId("chart-value");
  expect(valor.parentElement).toBe(primero.parentElement);
  expect(parseFloat(valor.style.left)).toBeGreaterThanOrEqual(0);
  expect(parseFloat(valor.style.left) + parseFloat(valor.style.width)).toBeLessThanOrEqual(200);
  fireEvent.mouseLeave(primero);

  zona.scrollLeft = 280;
  fireEvent.scroll(zona);
  fireEvent.focus(ultimo);
  valor = screen.getByTestId("chart-value");
  expect(parseFloat(valor.style.left)).toBeGreaterThanOrEqual(280);
  expect(parseFloat(valor.style.left) + parseFloat(valor.style.width)).toBeLessThanOrEqual(480);
  expect(valor.className).toContain("pointer-events-none");
});
