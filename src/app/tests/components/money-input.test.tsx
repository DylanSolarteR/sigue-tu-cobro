// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import MoneyInput from "@/components/dashboard/MoneyInput";
afterEach(cleanup);
it("formatea miles, usa teclado numérico y rechaza letras sin alterar el valor", () => {
  const change = vi.fn();
  const { rerender } = render(<MoneyInput id="amount" value="1234" onChange={change} />);
  const input = screen.getByRole<HTMLInputElement>("textbox");
  expect(input.value).toBe("1.234");
  expect(input.inputMode).toBe("numeric");
  fireEvent.change(input, { target: { value: "1.234a" } });
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeTruthy();
  fireEvent.change(input, { target: { value: "1.234.567" } });
  expect(change).toHaveBeenCalledWith("1234567");
  rerender(<MoneyInput id="amount" value="1234567" onChange={change} />);
  expect(input.value).toBe("1.234.567");
});
