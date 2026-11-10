// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/DatePicker";

afterEach(cleanup);

it("permite elegir un día de calendario sin convertirlo mediante UTC", () => {
  const setDate = vi.fn();
  render(<DatePicker date={new Date(2026, 0, 1)} setDate={setDate} />);
  const input = screen.getByLabelText("Fecha de pago") as HTMLInputElement;
  expect(input.type).toBe("date");
  expect(input.value).toBe("2026-01-01");
  fireEvent.change(input, { target: { value: "2026-12-31" } });
  const selected = setDate.mock.calls[0]?.[0] as Date;
  expect([selected.getFullYear(), selected.getMonth() + 1, selected.getDate()]).toEqual([2026, 12, 31]);
});
