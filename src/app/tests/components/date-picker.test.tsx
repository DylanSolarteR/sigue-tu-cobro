// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/DatePicker";
import DateField from "@/components/dashboard/DateField";

afterEach(cleanup);
it("permite elegir un día de calendario sin convertirlo mediante UTC", () => {
  const setDate = vi.fn();
  render(<DatePicker date={new Date(2026, 0, 1)} setDate={setDate} />);
  fireEvent.click(screen.getByRole("button", { name: /fecha de pago/i }));
  fireEvent.click(screen.getByRole("button", { name: /31 de enero de 2026/i }));
  const selected = setDate.mock.calls[0]?.[0] as Date;
  expect([selected.getFullYear(), selected.getMonth() + 1, selected.getDate()]).toEqual([2026, 1, 31]);
});

it("permite navegar entre meses y limpiar el filtro de fecha", () => {
  const change = vi.fn();
  render(<DateField id="desde" label="Desde" value="2026-01-31" onChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "Desde" }));
  fireEvent.click(screen.getByRole("button", { name: "Mes siguiente" }));
  fireEvent.click(screen.getByRole("button", { name: "28 de febrero de 2026" }));
  expect(change).toHaveBeenCalledWith("2026-02-28");
  fireEvent.click(screen.getByRole("button", { name: "Desde" }));
  fireEvent.click(screen.getByRole("button", { name: /limpiar fecha/i }));
  expect(change).toHaveBeenLastCalledWith("");
});
