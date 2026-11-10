// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";

vi.mock("@/trpc/server", () => ({ HydrateClient: ({ children }: { children: React.ReactNode }) => children }));
afterEach(cleanup);

it("presenta el flujo real y permite entrar o registrarse", async () => {
  render(await Home());
  expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/cobro/i);
  expect(screen.getAllByRole("link", { name: /iniciar sesión/i }).some((link) => link.getAttribute("href") === "/entrar")).toBe(true);
  expect(screen.getAllByRole("link", { name: /crear.*cuenta/i }).some((link) => link.getAttribute("href") === "/registro")).toBe(true);
  expect(screen.queryByText(/no est[aá] optimizada/i)).toBeNull();
  expect(screen.queryByText(/para independientes y pequeños empresarios que quieren dedicar menos tiempo/i)).toBeNull();
  expect(screen.queryByText(/un recorrido sencillo para que cada concepto encuentre su lugar/i)).toBeNull();
});
