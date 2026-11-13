import { spawn } from "node:child_process";
import { config } from "dotenv";
config();
if (process.env.STC_E2E || process.env.E2E_CONTROL_TOKEN) throw new Error("Desactive los mocks E2E antes del build de producción.");
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], { stdio: "inherit" });
child.on("error", () => { process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
