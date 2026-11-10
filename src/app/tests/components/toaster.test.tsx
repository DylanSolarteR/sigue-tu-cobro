// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "dark" }) }));
vi.mock("sonner", () => ({ Toaster: ({ toastOptions }: { toastOptions: { classNames: { toast: string; error: string; success: string } } }) => <div data-testid="toaster" data-toast={toastOptions.classNames.toast} data-error={toastOptions.classNames.error} data-success={toastOptions.classNames.success} /> }));
import { Toaster } from "@/components/Toaster";
it("aplica identidad visual a las notificaciones y sus estados", () => {
  render(<Toaster />);
  const toaster = screen.getByTestId("toaster");
  expect(toaster.getAttribute("data-toast")).toContain("stc-toast");
  expect(toaster.getAttribute("data-error")).toContain("stc-toast-error");
  expect(toaster.getAttribute("data-success")).toContain("stc-toast-success");
});
