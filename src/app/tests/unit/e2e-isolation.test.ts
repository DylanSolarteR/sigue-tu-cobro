import { spawnSync } from "node:child_process";
import { afterEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/e2e-control/route";
import { NextRequest } from "next/server";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
vi.mock("@/env", () => ({ env: {} }));
vi.mock("mysql2/promise", () => ({ createPool: vi.fn() }));

it("aborta si el harness intenta importar el módulo real de base de datos", async () => {
  vi.stubEnv("STC_E2E", "1");
  await expect(import("@/server/db")).rejects.toThrow("La conexión real está prohibida en E2E.");
});

it("el control de fixtures no está disponible fuera del harness", async () => {
  const response = await POST(new NextRequest("http://localhost:3123/api/e2e-control", { method: "POST", body: "{}" }));
  expect(response.status).toBe(404);
});

it("el comando de producción rechaza un entorno con mocks habilitados", () => {
  const result = spawnSync(process.execPath, ["scripts/production-build.mjs"], { env: { ...process.env, STC_E2E: "1" }, encoding: "utf8" });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("Desactive los mocks E2E");
});
