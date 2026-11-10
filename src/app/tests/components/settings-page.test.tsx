// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Config from "@/app/(dashboard)/dashboard/config/[[...rest]]/page";

vi.mock("@clerk/nextjs", () => ({ UserProfile: () => <div>Perfil de usuario</div> }));
afterEach(cleanup);

it("presenta la configuración de cuenta con el perfil disponible", () => {
  render(<Config />);
  expect(screen.getByRole("heading", { name: "Configuración" })).toBeTruthy();
  expect(screen.getByText("Perfil de usuario")).toBeTruthy();
});
