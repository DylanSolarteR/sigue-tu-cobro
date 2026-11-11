import { spawn } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.e2e.local" });
const env = { ...process.env, STC_E2E: "1", SKIP_ENV_VALIDATION: "1" };
if (!env.E2E_CONTROL_TOKEN) throw new Error("Playwright debe iniciar este servidor.");
// Existing environment values take precedence over .env when Next starts.
Object.assign(env, { SINGLESTORE_HOST: "127.0.0.1", SINGLESTORE_PORT: "1", SINGLESTORE_USER: "blocked", SINGLESTORE_PASSWORD: "blocked", SINGLESTORE_DATABASE: "blocked" });
const next = "node_modules/next/dist/bin/next";
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [next, ...args], { env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Next terminó con ${code}`)));
  });
}
if (process.env.E2E_REUSE_BUILD !== "1") await run(["build", "--webpack"]);
await run(["start", "--hostname", "127.0.0.1", "--port", "3123"]);
