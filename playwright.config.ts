import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.e2e.local" });
process.env.E2E_CONTROL_TOKEN ??= randomUUID();

export default defineConfig({
  testDir: "./src/app/tests/e2e",
  testIgnore: "**/harness/**",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3123", trace: "retain-on-failure", screenshot: "only-on-failure", acceptDownloads: true },
  webServer: { command: "node scripts/e2e-server.mjs", url: "http://127.0.0.1:3123", timeout: 240_000, reuseExistingServer: false, stdout: "pipe" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
