// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import type { UserProfile } from "@clerk/nextjs";
import Config from "@/app/(dashboard)/dashboard/config/[[...rest]]/page";

const profile = vi.hoisted(() => vi.fn<(props: ComponentProps<typeof UserProfile>) => void>());
vi.mock("@clerk/nextjs", () => ({ UserProfile: (props: ComponentProps<typeof UserProfile>) => { profile(props); return <div>Perfil de usuario</div>; } }));
afterEach(cleanup);

it("presenta la configuración de cuenta con el perfil disponible", () => {
  render(<Config />);
  expect(screen.getByRole("heading", { name: "Configuración" })).toBeTruthy();
  expect(screen.getByText("Perfil de usuario")).toBeTruthy();
  expect(profile.mock.calls[0]?.[0].appearance?.elements).toMatchObject({ rootBox: { width: "100%", maxWidth: "none" }, cardBox: { width: "100%", maxWidth: "none" } });
});
