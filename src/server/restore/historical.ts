import { createHash } from "node:crypto";
import { z } from "zod";
import { billingDateSchema, calendarDateToCivil, parseBillingDateForCalendar } from "../../lib/billing-date";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Cell = string | number | null;
export type Row = Record<string, Cell>;
export type Dataset = { actors: Row[]; statements: Row[]; items: Row[] };
type Entity = keyof Dataset;

export const COLUMNS = {
  actors: ["id", "owner_id", "name", "doc_type", "doc_number", "type", "expedition_place", "telephone", "is_active", "created_at", "updated_at"],
  statements: ["id", "owner_id", "client_id", "creditor_id", "amount", "extra_info", "status", "show_item_amount", "pay_date", "is_active", "created_at", "updated_at"],
  items: ["id", "owner_id", "billing_statement_id", "client_id", "status", "desc", "amount", "is_active", "created_at", "updated_at"],
} as const;
const LEGACY_COLUMNS = { ...COLUMNS, items: COLUMNS.items.filter((key) => key !== "client_id" && key !== "status") };
const TABLES: Record<string, Entity> = {
  stc_actor_table: "actors", stc_billing_statement_table: "statements", stc_billing_statement_item_table: "items",
};
const TEXT = z.string().min(1).refine((value) => value.trim().length > 0);
const FLAG = z.union([z.literal(0), z.literal(1), z.boolean()]).transform(Number);
const MONEY = z.number().int().min(0).max(2147483647);
const BASE = { id: TEXT, owner_id: TEXT, is_active: FLAG, created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }) };
const ACTOR = z.strictObject({ ...BASE, name: TEXT, doc_type: z.enum(["CC", "CE", "NIT"]), doc_number: TEXT, type: z.enum(["client", "creditor"]), expedition_place: z.string().nullable(), telephone: z.string().nullable() });
const STATEMENT_FIELDS = { ...BASE, client_id: TEXT, creditor_id: TEXT, amount: MONEY, extra_info: z.string(), show_item_amount: FLAG, pay_date: billingDateSchema };
const LEGACY_STATEMENT = z.strictObject({ ...STATEMENT_FIELDS, status: z.enum(["payed", "pending"]) });
const STATEMENT = z.strictObject({ ...STATEMENT_FIELDS, status: z.enum(["paid", "pending"]) });
const ITEM_FIELDS = { ...BASE, desc: TEXT, amount: MONEY };
const LEGACY_ITEM = z.strictObject({ ...ITEM_FIELDS, billing_statement_id: TEXT });
const ITEM = z.strictObject({ ...ITEM_FIELDS, billing_statement_id: TEXT.nullable(), client_id: TEXT, status: z.enum(["pending", "added", "paid"]) });
const LEGACY = z.strictObject({ actors: z.array(ACTOR), statements: z.array(LEGACY_STATEMENT), items: z.array(LEGACY_ITEM) });
const V2 = z.strictObject({ actors: z.array(ACTOR), statements: z.array(STATEMENT), items: z.array(ITEM) });

function failure<T>(error: string): Result<T> { return { ok: false, error }; }

// Deliberately limited reader for our logical exports. It never executes dump SQL.
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let statement = "";
  let quote: string | null = null;
  for (let index = 0; index < sql.length; index++) {
    const char = sql[index]!;
    const next = sql[index + 1];
    if (quote) {
      statement += char;
      if (char === "\\" && quote !== "`") {
        if (next === undefined) throw new Error("Literal incompleto");
        statement += next; index++;
      } else if (char === quote) {
        if (next === quote) { statement += next; index++; } else quote = null;
      }
    } else if (char === "'" || char === '"' || char === "`") {
      quote = char; statement += char;
    } else if (char === "-" && next === "-" && /\s/.test(sql[index + 2] ?? "\n")) {
      while (index < sql.length && sql[index] !== "\n") index++;
      statement += "\n";
    } else if (char === ";") {
      if (statement.trim()) statements.push(statement.trim());
      statement = "";
    } else statement += char;
  }
  if (quote || statement.trim()) throw new Error("Instrucción o literal sin terminar");
  return statements;
}

function parseValues(source: string): Cell[] {
  let index = 0;
  const values: Cell[] = [];
  const whitespace = () => { while (/\s/.test(source[index] ?? "") && index < source.length) index++; };
  const escapes: Record<string, string> = { "0": "\0", b: "\b", n: "\n", r: "\r", t: "\t", Z: "\x1a", "\\": "\\", "'": "'", '"': '"' };
  whitespace();
  while (index < source.length) {
    const quote = source[index];
    if (quote === "'" || quote === '"') {
      index++;
      let value = "";
      let closed = false;
      while (index < source.length) {
        const char = source[index++]!;
        if (char === "\\") {
          const escaped = source[index++];
          if (escaped === undefined || !Object.hasOwn(escapes, escaped)) throw new Error("Escape SQL no admitido");
          value += escapes[escaped];
        } else if (char === quote) {
          if (source[index] === quote) { value += quote; index++; } else { closed = true; break; }
        } else value += char;
      }
      if (!closed) throw new Error("Literal incompleto");
      values.push(value);
    } else {
      const token = /^[^,]+/.exec(source.slice(index))?.[0]?.trim();
      if (token === undefined) throw new Error("Valor SQL vacío");
      if (token === "NULL") values.push(null);
      else if (/^-?(?:0|[1-9]\d*)$/.test(token) && Number.isSafeInteger(Number(token))) values.push(Number(token));
      else throw new Error("Valor SQL no admitido");
      index += /^[^,]+/.exec(source.slice(index))![0].length;
    }
    whitespace();
    if (index === source.length) break;
    if (source[index++] !== ",") throw new Error("Separador SQL inválido");
    whitespace();
    if (index === source.length) throw new Error("Valor SQL ausente");
  }
  return values;
}

function validateIdentity(data: Dataset): Result<true> {
  for (const entity of ["actors", "statements", "items"] as const) {
    const ids = data[entity].map((row) => row.id);
    if (new Set(ids).size !== ids.length) return failure(`IDs duplicados en ${entity}`);
  }
  return { ok: true, value: true };
}

export function parseLegacyDump(sql: string): Result<Dataset> {
  try {
    const data: Dataset = { actors: [], statements: [], items: [] };
    let insertCount = 0;
    for (const statement of splitStatements(sql)) {
      if (/^SET NAMES utf8mb4$/i.test(statement)) continue;
      const create = /^CREATE TABLE `([a-z_]+)` \(([\s\S]+)\)([\s\S]*)$/.exec(statement);
      if (create) {
        if (!Object.hasOwn(TABLES, create[1]!) || !/^\s*(?:[A-Z_]+=(?:[A-Z_]+|'[A-Z_,]+'|`[a-z0-9_]+`)\s*|CHARACTER SET=`[a-z0-9_]+`\s*|COLLATE=`[a-z0-9_]+`\s*)*$/i.test(create[3]!)) return failure("CREATE TABLE no admitido");
        continue;
      }
      const insert = /^INSERT INTO `([a-z_]+)` \(([^)]+)\) VALUES \(([\s\S]*)\)$/i.exec(statement);
      if (!insert || !Object.hasOwn(TABLES, insert[1]!)) return failure("Instrucción SQL no admitida");
      const entity = TABLES[insert[1]!]!;
      const columns = insert[2]!.split(",").map((part) => {
        const column = /^\s*`([a-z_]+)`\s*$/.exec(part);
        if (!column) throw new Error("Columna SQL inválida");
        return column[1]!;
      });
      const expected: readonly string[] = LEGACY_COLUMNS[entity];
      if (columns.length !== expected.length || new Set(columns).size !== columns.length || columns.some((column) => !expected.includes(column))) return failure("Columnas históricas inesperadas");
      const values = parseValues(insert[3]!);
      if (values.length !== columns.length) return failure("Cantidad de valores inesperada");
      data[entity].push(Object.fromEntries(columns.map((column, index) => [column, values[index]!])));
      insertCount++;
    }
    if (!insertCount) return failure("El respaldo no contiene registros");
    const parsed = LEGACY.safeParse(data);
    if (!parsed.success) return failure(`Formato histórico inválido: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
    const identity = validateIdentity(parsed.data);
    return identity.ok ? { ok: true, value: parsed.data } : identity;
  } catch (error) {
    return failure(error instanceof Error ? error.message : "No se pudo leer el respaldo");
  }
}

function validateRelationships(data: Dataset): Result<true> {
  const actors = new Map(data.actors.map((row) => [row.id, row]));
  const statements = new Map(data.statements.map((row) => [row.id, row]));
  const totals = new Map<Cell | undefined, number>();
  for (const statement of data.statements) {
    const client = actors.get(statement.client_id);
    const creditor = actors.get(statement.creditor_id);
    if (client?.type !== "client" || creditor?.type !== "creditor" || client.owner_id !== statement.owner_id || creditor.owner_id !== statement.owner_id) return failure("Cliente, acreedor o propietario de cuenta inconsistente");
  }
  for (const item of data.items) {
    const client = actors.get(item.client_id);
    if (client?.type !== "client" || client.owner_id !== item.owner_id) return failure("Cliente o propietario de ítem inconsistente");
    if (item.billing_statement_id === null) {
      if (item.status !== "pending") return failure("Ítem sin cuenta con estado inconsistente");
      continue;
    }
    const statement = statements.get(item.billing_statement_id);
    if (!statement || statement.owner_id !== item.owner_id || statement.client_id !== item.client_id || item.status !== (statement.status === "paid" ? "paid" : "added")) return failure("Cuenta, cliente, propietario o estado de ítem inconsistente");
    if (item.is_active === 1) totals.set(statement.id, (totals.get(statement.id) ?? 0) + Number(item.amount));
  }
  for (const statement of data.statements) {
    if (statement.amount !== (totals.get(statement.id) ?? 0)) return failure("El importe de una cuenta no coincide con sus ítems activos");
  }
  return { ok: true, value: true };
}

export function parseV2Data(value: unknown): Result<Dataset> {
  const parsed = V2.safeParse(value);
  if (!parsed.success) return failure(`Formato v2 inválido: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  const identity = validateIdentity(parsed.data);
  if (!identity.ok) return identity;
  const relationships = validateRelationships(parsed.data);
  return relationships.ok ? { ok: true, value: parsed.data } : relationships;
}

export function validateV2(data: Dataset): Result<true> {
  const parsed = parseV2Data(data);
  return parsed.ok ? { ok: true, value: true } : parsed;
}

export function convertLegacy(data: Dataset): Result<Dataset> {
  const parsed = LEGACY.safeParse(data);
  if (!parsed.success) return failure(`Formato histórico inválido: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  const identity = validateIdentity(parsed.data);
  if (!identity.ok) return identity;
  const statements: Row[] = [];
  for (const statement of parsed.data.statements) {
    const calendar = parseBillingDateForCalendar(statement.pay_date);
    if (!calendar.ok) return failure("Fecha histórica inválida");
    const civil = calendarDateToCivil(calendar.value);
    if (!civil.ok) return failure("Fecha histórica inválida");
    statements.push({ ...statement, status: statement.status === "payed" ? "paid" : "pending", pay_date: civil.value });
  }
  const byId = new Map(statements.map((row) => [row.id, row]));
  const items: Row[] = [];
  for (const item of parsed.data.items) {
    const statement = byId.get(item.billing_statement_id);
    if (!statement) return failure("Ítem histórico sin cuenta");
    items.push({ ...item, client_id: statement.client_id!, status: statement.status === "paid" ? "paid" : "added" });
  }
  return parseV2Data({ actors: parsed.data.actors, statements, items });
}

export function canonicalize(data: Dataset): Dataset {
  const ordered = (entity: Entity) => [...data[entity]].sort((a, b) => String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0)
    .map((row) => Object.fromEntries(COLUMNS[entity].map((key) => [key, row[key]])) as Row);
  return { actors: ordered("actors"), statements: ordered("statements"), items: ordered("items") };
}

export function fingerprint(data: Dataset): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(data))).digest("hex");
}

export function summarize(data: Dataset) {
  const statuses = (rows: Row[]) => rows.reduce<Record<string, number>>((counts, row) => {
    const status = String(row.status); counts[status] = (counts[status] ?? 0) + 1; return counts;
  }, {});
  return {
    counts: { actors: data.actors.length, statements: data.statements.length, items: data.items.length },
    statementStatuses: statuses(data.statements), itemStatuses: statuses(data.items),
    amounts: {
      statements: data.statements.reduce((total, row) => total + Number(row.amount), 0),
      activeItems: data.items.reduce((total, row) => total + (row.is_active === 1 ? Number(row.amount) : 0), 0),
      items: data.items.reduce((total, row) => total + Number(row.amount), 0),
    },
  };
}
