// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Config from "@/app/(dashboard)/dashboard/config/[[...rest]]/page";

const profile = vi.hoisted(() => vi.fn());
vi.mock("@clerk/nextjs", () => ({ UserProfile: (props: unknown) => { profile(props); return <div>Perfil de usuario</div>; } }));
afterEach(cleanup);

it("presenta la configuración de cuenta con el perfil disponible", () => {
  render(<Config />);
  expect(screen.getByRole("heading", { name: "Configuración" })).toBeTruthy();
  expect(screen.getByText("Perfil de usuario")).toBeTruthy();
  expect(profile).toHaveBeenCalledWith(expect.objectContaining({ appearance: expect.objectContaining({ elements: expect.objectContaining({ rootBox: { width: "100%", maxWidth: "none" }, cardBox: { width: "100%", maxWidth: "none" } }) }) }));
});
