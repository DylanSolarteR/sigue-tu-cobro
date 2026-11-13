import { createConnection, type Connection, type RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { COLUMNS, type Cell, type Dataset } from "./historical";
import type { RestoreStore } from "./transaction";

export const TABLES = {
  actors: "stc_actor_table_v2",
  statements: "stc_billing_statement_table_v2",
  items: "stc_billing_statement_item_table_v2",
} as const;
export const ENTITIES = ["actors", "statements", "items"] as const;
const CONFIG = z.object({
  SINGLESTORE_HOST: z.string().min(1), SINGLESTORE_PORT: z.coerce.number().int().min(1).max(65535),
  SINGLESTORE_DATABASE: z.string().min(1), SINGLESTORE_USER: z.string().min(1), SINGLESTORE_PASSWORD: z.string().min(1),
});
const ROW = z.record(z.string(), z.union([z.string(), z.number().finite(), z.null()]));
export function targetFromEnv() {
  const env = CONFIG.parse(process.env);
  return { host: env.SINGLESTORE_HOST, port: env.SINGLESTORE_PORT, database: env.SINGLESTORE_DATABASE };
}
export async function connectDatabase(): Promise<Connection> {
  if (process.env.STC_E2E || process.env.E2E_CONTROL_TOKEN) throw new Error("Restauración prohibida con variables E2E.");
  const env = CONFIG.parse(process.env);
  return createConnection({ ...targetFromEnv(), user: env.SINGLESTORE_USER, password: env.SINGLESTORE_PASSWORD, ssl: {}, multipleStatements: false, connectTimeout: 15000 });
}
function quote(name: string) { return `\`${name}\``; }
export async function readDataset(connection: Connection, legacy = false): Promise<Dataset> {
  const data: Dataset = { actors: [], statements: [], items: [] };
  for (const entity of ENTITIES) {
    const columns = COLUMNS[entity].filter((column) => !legacy || entity !== "items" || (column !== "client_id" && column !== "status"));
    const table = legacy ? TABLES[entity].replace(/_v2$/, "") : TABLES[entity];
    const [rows] = await connection.query<RowDataPacket[]>(`SELECT ${columns.map(quote).join(", ")} FROM ${quote(table)} ORDER BY id`);
    data[entity] = rows.map((row) => ROW.parse(row));
  }
  return data;
}
export async function readSchemas(connection: Connection, legacy = false): Promise<Record<string, string>> {
  const schemas: Record<string, string> = {};
  for (const entity of ENTITIES) {
    const table = legacy ? TABLES[entity].replace(/_v2$/, "") : TABLES[entity];
    const [rows] = await connection.query<RowDataPacket[]>(`SHOW CREATE TABLE ${quote(table)}`);
    const ddl = rows[0]?.["Create Table"] as unknown;
    if (typeof ddl !== "string") throw new Error("No se pudo inspeccionar el esquema.");
    schemas[table] = ddl;
    if (legacy) continue;
    const [metadata] = await connection.query<RowDataPacket[]>(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [table]);
    const columns = z.array(z.object({ COLUMN_NAME: z.string(), COLUMN_TYPE: z.string(), IS_NULLABLE: z.enum(["YES", "NO"]), COLUMN_KEY: z.string() })).parse(metadata);
    if (columns.length !== COLUMNS[entity].length) throw new Error("El esquema v2 tiene columnas inesperadas.");
    for (const column of columns) {
      const name = column.COLUMN_NAME;
      const expectedColumns: readonly string[] = COLUMNS[entity];
      if (!expectedColumns.includes(name)) throw new Error("Columna v2 inesperada.");
      const nullable = name === "telephone" || name === "expedition_place" || (entity === "items" && name === "billing_statement_id");
      const expectedType = name === "amount" ? /^int(?:\(\d+\))?$/ : name === "is_active" || name === "show_item_amount" ? /^tinyint\(1\)$/ : name === "doc_type" ? /^enum\('CC','CE','NIT'\)$/ : name === "type" ? /^enum\('client','creditor'\)$/ : name === "status" ? (entity === "items" ? /^enum\('pending','added','paid'\)$/ : /^enum\('pending','paid'\)$/) : /^text$/;
      if (!expectedType.test(column.COLUMN_TYPE) || column.IS_NULLABLE !== (nullable ? "YES" : "NO") || (name === "id" && column.COLUMN_KEY !== "PRI")) throw new Error("El esquema v2 no coincide con el contrato de restauración.");
    }
  }
  return schemas;
}
export function createRestoreStore(connection: Connection): RestoreStore {
  return {
    begin: () => connection.beginTransaction(),
    read: () => readDataset(connection),
    clear: async (entity) => { await connection.query(`DELETE FROM ${quote(TABLES[entity])}`); },
    insert: async (entity, rows) => {
      const columns = COLUMNS[entity];
      const sql = `INSERT INTO ${quote(TABLES[entity])} (${columns.map(quote).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
      for (const row of rows) {
        const values: Cell[] = columns.map((name) => row[name] ?? null);
        await connection.execute(sql, values);
      }
    },
    commit: () => connection.commit(),
    rollback: () => connection.rollback(),
  };
}
export function legacySql(data: Dataset, schemas: Record<string, string>): string {
  const literal = (value: Cell) => value === null ? "NULL" : typeof value === "number" ? String(value) : `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\0/g, "\\0").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\x1a/g, "\\Z")}'`;
  const parts = ["-- Local logical snapshot. Original tables are unchanged.", "SET NAMES utf8mb4;"];
  for (const entity of ENTITIES) {
    const table = TABLES[entity].replace(/_v2$/, "");
    parts.push(`${schemas[table]};`);
    const columns = COLUMNS[entity].filter((name) => entity !== "items" || (name !== "client_id" && name !== "status"));
    for (const row of data[entity]) parts.push(`INSERT INTO ${quote(table)} (${columns.map(quote).join(", ")}) VALUES (${columns.map((name) => literal(row[name] ?? null)).join(", ")});`);
  }
  return parts.join("\n");
}
