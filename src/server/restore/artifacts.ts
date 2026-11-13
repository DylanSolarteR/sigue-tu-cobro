import { execFile } from "node:child_process";
import { mkdir, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { promisify } from "node:util";

function inside(root: string, path: string) {
  const child = relative(root, path);
  return child !== ".." && !child.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(child);
}
/** Private output is restricted to an external backup root, including resolved junctions. */
export async function privateDirectory(path: string, backupRoot = resolve(process.cwd(), "..", "backups")) {
  const root = await realpath(backupRoot);
  try {
    await promisify(execFile)("git", ["-C", root, "rev-parse", "--show-toplevel"]);
  } catch (error) {
    const failure = error as { code?: unknown; stderr?: unknown };
    if (failure.code !== 128 || typeof failure.stderr !== "string" || !failure.stderr.includes("not a git repository")) throw new Error("No se pudo verificar la privacidad del directorio de respaldos.");
    const requested = resolve(path);
    if (!inside(root, requested)) throw new Error("El destino debe estar dentro del directorio externo de respaldos.");
    await mkdir(requested, { recursive: true });
    const actual = await realpath(requested);
    if (!inside(root, actual)) throw new Error("El destino resuelto sale del directorio de respaldos.");
    // A child can itself be a separate worktree even if its parent is not one.
    try {
      await promisify(execFile)("git", ["-C", actual, "rev-parse", "--show-toplevel"]);
    } catch (childError) {
      const childFailure = childError as { code?: unknown; stderr?: unknown };
      if (childFailure.code === 128 && typeof childFailure.stderr === "string" && childFailure.stderr.includes("not a git repository")) return actual;
      throw new Error("No se pudo verificar la privacidad del destino.");
    }
    throw new Error("El destino pertenece a un repositorio.");
  }
  throw new Error("El directorio de respaldos pertenece a un repositorio.");
}
