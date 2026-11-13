import { config } from "dotenv";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod";
import { canonicalize, convertLegacy, fingerprint, parseLegacyDump, parseV2Data, summarize, type Dataset, type Result } from "./historical";
import { connectDatabase, createRestoreStore, legacySql, readDataset, readSchemas, targetFromEnv } from "./database";
import { executeRestore } from "./transaction";
import { privateDirectory } from "./artifacts";

config();
class RestoreError extends Error {}
function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new RestoreError(result.error);
  return result.value;
}
function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
async function json(path: string): Promise<unknown> { return JSON.parse(await readFile(path, "utf8")) as unknown; }
async function save(path: string, value: unknown) {
  const text = JSON.stringify(value, null, 2) + "\n";
  await writeFile(path, text, { flag: "wx", mode: 0o600 });
  if (await readFile(path, "utf8") !== text) throw new RestoreError("No se pudo verificar el archivo local.");
}
const outputDirectory = privateDirectory;
const MANIFEST = z.object({
  format: z.literal("stc-v2-restore-1"), sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/), target: z.object({ host: z.string(), port: z.number().int(), database: z.string() }),
  schemaSha256: z.string().regex(/^[a-f0-9]{64}$/),
});
async function prepared(directory: string, expectedHash: string) {
  const manifest = MANIFEST.parse(await json(resolve(directory, "manifest.json")));
  const data = unwrap(parseV2Data(await json(resolve(directory, "prepared.json"))));
  if (manifest.fingerprint !== fingerprint(data) || manifest.fingerprint !== expectedHash) throw new RestoreError("Hash de preparación incorrecto.");
  return { manifest, data };
}
async function main() {
  const { positionals, values } = parseArgs({ allowPositionals: true, strict: true, options: {
    source: { type: "string" }, out: { type: "string" }, prepared: { type: "string" },
    "expected-hash": { type: "string" }, "expect-database": { type: "string" }, maintenance: { type: "boolean", default: false },
  } });
  const operation = positionals[0];
  if (positionals.length !== 1 || !["inspect", "prepare", "apply", "verify"].includes(operation ?? "")) throw new RestoreError("Use inspect, prepare, apply o verify con opciones explícitas.");
  if (operation === "inspect" || operation === "prepare") {
    if (!values.source) throw new RestoreError("Falta --source (ruta SQL o legacy-live).");
    let source: string;
    let legacy: Dataset;
    if (values.source === "legacy-live") {
      if (!values.maintenance || !values.out) throw new RestoreError("La captura v1 requiere --maintenance y --out con escrituras detenidas.");
      const directory = await outputDirectory(values.out);
      const connection = await connectDatabase();
      try {
        await connection.beginTransaction();
        const schemas = await readSchemas(connection, true);
        legacy = await readDataset(connection, true);
        await connection.rollback();
        source = legacySql(legacy, schemas);
        await writeFile(resolve(directory, "legacy-source.sql"), source, { flag: "wx", mode: 0o600 });
        const disk = await readFile(resolve(directory, "legacy-source.sql"), "utf8");
        if (hash(disk) !== hash(source)) throw new RestoreError("El respaldo v1 no coincide.");
        // The snapshot must also survive our SQL decoder before it can become a source.
        const decoded = unwrap(parseLegacyDump(disk));
        if (JSON.stringify(decoded) !== JSON.stringify(legacy)) {
          const left = unwrap(convertLegacy(decoded)); const right = unwrap(convertLegacy(legacy));
          if (fingerprint(left) !== fingerprint(right)) throw new RestoreError("La lectura del respaldo v1 difiere del origen.");
        }
        legacy = decoded;
      } finally { await connection.end(); }
    } else {
      source = await readFile(values.source, "utf8");
      legacy = unwrap(parseLegacyDump(source));
    }
    const data = unwrap(convertLegacy(legacy));
    const summary = { sourceSha256: hash(source), fingerprint: fingerprint(data), ...summarize(data) };
    if (operation === "inspect") { console.log(JSON.stringify(summary)); return; }
    if (!values.out) throw new RestoreError("Falta --out.");
    const directory = await outputDirectory(values.out);
    const connection = await connectDatabase();
    let schemas: Record<string, string>;
    try { schemas = await readSchemas(connection); } finally { await connection.end(); }
    const manifest = { format: "stc-v2-restore-1", ...summary, target: targetFromEnv(), schemaSha256: hash(JSON.stringify(schemas)) };
    await save(resolve(directory, "prepared.json"), canonicalize(data));
    await save(resolve(directory, "manifest.json"), manifest);
    console.log(JSON.stringify({ operation, ...summary, prepared: directory }));
    return;
  }
  if (!values.prepared || !values["expected-hash"]) throw new RestoreError("Faltan --prepared y --expected-hash.");
  const { manifest, data } = await prepared(values.prepared, values["expected-hash"]);
  const target = targetFromEnv();
  if (JSON.stringify(manifest.target) !== JSON.stringify(target)) throw new RestoreError("El destino no coincide con el manifiesto.");
  if (operation === "apply" && (!values.maintenance || values["expect-database"] !== target.database)) throw new RestoreError("Aplicar requiere --maintenance y --expect-database correctos.");
  const connection = await connectDatabase();
  try {
    const schemas = await readSchemas(connection);
    if (hash(JSON.stringify(schemas)) !== manifest.schemaSha256) throw new RestoreError("El esquema cambió desde la preparación.");
    const current = await readDataset(connection);
    const currentHash = fingerprint(current);
    if (operation === "verify" || currentHash === manifest.fingerprint) {
      const matches = currentHash === manifest.fingerprint;
      console.log(JSON.stringify({ operation, matches, ...summarize(current), fingerprint: currentHash }));
      if (!matches) process.exitCode = 1;
      return;
    }
    if (!values.out) throw new RestoreError("Aplicar requiere --out para respaldar v2 antes de modificarla.");
    const directory = await outputDirectory(values.out);
    await save(resolve(directory, "before-v2.json"), canonicalize(current));
    await save(resolve(directory, "before-schema.json"), schemas);
    await save(resolve(directory, "before-manifest.json"), { target, fingerprint: currentHash, ...summarize(current), schemaSha256: hash(JSON.stringify(schemas)), createdAt: new Date().toISOString() });
    const recovered = unwrap(parseV2Data(await json(resolve(directory, "before-v2.json"))));
    if (fingerprint(recovered) !== currentHash) throw new RestoreError("La lectura del respaldo v2 no coincide.");
    const result = await executeRestore(createRestoreStore(connection), data, currentHash);
    await save(resolve(directory, "result.json"), { ...result, recordedAt: new Date().toISOString() });
    console.log(JSON.stringify({ operation, ...result }));
    if (!result.ok) { process.exitCode = 1; return; }
  } finally { await connection.end(); }
  const verifier = await connectDatabase();
  try {
    const actual = await readDataset(verifier);
    if (fingerprint(actual) !== manifest.fingerprint) throw new RestoreError("La verificación con conexión nueva falló; mantener la aplicación detenida.");
    console.log(JSON.stringify({ operation: "post-commit-verify", matches: true, ...summarize(actual), fingerprint: fingerprint(actual) }));
  } finally { await verifier.end(); }
}
main().catch((error: unknown) => {
  // Database errors may echo SQL values. Details stay out of terminal logs and tracked reports.
  console.error(error instanceof RestoreError ? error.message : "La operación se detuvo. No reintente apply si hubo pérdida de conexión; ejecute verify y revise los artefactos locales.");
  process.exitCode = 1;
});
