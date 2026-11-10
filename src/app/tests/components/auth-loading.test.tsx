// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("@clerk/nextjs", () => ({
  ClerkLoading: ({ children }: { children: ReactNode }) => <>{children}</>,
  ClerkLoaded: () => null,
  ClerkFailed: () => null,
}));
import AuthLoadingBoundary from "@/components/AuthLoadingBoundary";
afterEach(cleanup);
it("reserva espacio para el formulario mientras se inicia Clerk", () => {
  const { container } = render(<AuthLoadingBoundary><div>Formulario</div></AuthLoadingBoundary>);
  expect(screen.getByRole("status", { name: "Cargando formulario de acceso" })).toBeTruthy();
  expect(container.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(3);
});
