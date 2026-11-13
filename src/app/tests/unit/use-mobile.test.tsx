// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { useIsMobile } from "@/hooks/use-mobile";

function Probe() { return <span>{useIsMobile() ? "mobile" : "desktop"}</span>; }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("lee el media query vigente y deja de escucharlo al desmontar", async () => {
  const listeners = new Set<() => void>();
  const media = { matches: true, addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)), removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)) };
  vi.stubGlobal("matchMedia", vi.fn(() => media));
  const { unmount } = render(<Probe />);
  expect(screen.getByText("mobile")).toBeTruthy();
  await act(async () => { media.matches = false; for (const listener of listeners) listener(); });
  expect(screen.getByText("desktop")).toBeTruthy();
  unmount();
  expect(listeners.size).toBe(0);
});

it("ofrece una instantánea estable al renderizar en servidor", () => {
  expect(renderToString(<Probe />)).toContain("desktop");
});
