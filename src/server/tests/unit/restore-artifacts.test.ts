import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { privateDirectory } from "../../restore/artifacts";

const directories: string[] = [];
afterEach(async () => { for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true }); });
it("solo permite guardar artefactos dentro del directorio externo de respaldos", async () => {
  const root = await mkdtemp(join(tmpdir(), "stc-restore-")); directories.push(root);
  const backup = join(root, "backups"); await mkdir(backup);
  const allowed = await privateDirectory(join(backup, "run"), backup);
  expect(allowed.replaceAll("\\", "/")).toContain("backups/run");
  await expect(privateDirectory(join(root, "repo", "datos"), backup)).rejects.toThrow();
});
it("rechaza guardar datos dentro de un repositorio aunque se configure como raíz", async () => {
  const root = await mkdtemp(join(tmpdir(), "stc-restore-")); directories.push(root);
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  await promisify(execFile)("git", ["init", "--quiet", root]);
  await expect(privateDirectory(join(root, "backups"), root)).rejects.toThrow();
});
