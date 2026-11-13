import { describe, expect, it } from "vitest";
import {
  canonicalize, convertLegacy, fingerprint, parseLegacyDump, parseV2Data, summarize, validateV2,
  type Cell, type Dataset, type Result, type Row,
} from "../../restore/historical";

function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}
function legacy(): Dataset {
  const times = { created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" };
  const actor = { owner_id: "owner", doc_type: "CC", doc_number: "123", expedition_place: null, telephone: null, is_active: 1, ...times };
  return {
    actors: [{ id: "client", name: "Cliente", type: "client", ...actor }, { id: "creditor", name: "Acreedor", type: "creditor", ...actor }],
    statements: [{ id: "account", owner_id: "owner", client_id: "client", creditor_id: "creditor", amount: 120000, extra_info: "", status: "payed", show_item_amount: 1, pay_date: "2024-01-02T02:00:00.000Z", is_active: 1, ...times }],
    items: [{ id: "item", owner_id: "owner", billing_statement_id: "account", desc: "Servicio", amount: 120000, is_active: 1, ...times }],
  };
}
function literal(cell: Cell) {
  if (cell === null) return "NULL";
  if (typeof cell === "number") return String(cell);
  return `'${cell.replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll("\n", "\\n").replaceAll("\r", "\\r").replaceAll("\t", "\\t").replaceAll("\0", "\\0").replaceAll("\b", "\\b")}'`;
}
function insert(table: string, row: Row) {
  return `INSERT INTO \`${table}\` (${Object.keys(row).map((key) => `\`${key}\``).join(", ")}) VALUES (${Object.values(row).map(literal).join(", ")});`;
}
function dump(data = legacy()) {
  return ["-- Logical export\nSET NAMES utf8mb4;", "CREATE TABLE `stc_actor_table` (`id` text NOT NULL);", ...data.actors.map((row) => insert("stc_actor_table", row)), ...data.items.map((row) => insert("stc_billing_statement_item_table", row)), ...data.statements.map((row) => insert("stc_billing_statement_table", row))].join("\n");
}

describe("lector de respaldo histórico", () => {
  it("lee solo las tablas y columnas admitidas sin ejecutar SQL", () => {
    expect(unwrap(parseLegacyDump(dump()))).toEqual(legacy());
  });
  it("conserva Unicode, comillas, barras, escapes y separadores dentro de textos", () => {
    const data = legacy();
    data.items[0]!.desc = "Diseño 'á' \\\";\n-- texto\r\t\0\b";
    expect(unwrap(parseLegacyDump(dump(data))).items[0]!.desc).toBe(data.items[0]!.desc);
    expect(unwrap(parseLegacyDump(dump().replace("'Servicio'", "'D''Ávila;\nservicio'"))).items[0]!.desc).toBe("D'Ávila;\nservicio");
  });
  it.each([
    ["instrucción ajena", () => `${dump()}\nDELETE FROM stc_actor_table;`],
    ["tabla desconocida", () => dump().replace("INSERT INTO `stc_actor_table`", "INSERT INTO `other_table`")],
    ["columna duplicada", () => dump().replace("`id`, `name`", "`id`, `id`")],
    ["columna desconocida", () => dump().replace("`name`", "`unknown`")],
    ["literal sin cerrar", () => `${dump()}\nINSERT INTO \`stc_actor_table\` (\`id\`) VALUES ('open);`],
    ["falta de terminador", () => dump().slice(0, -1)],
    ["expresión SQL", () => dump().replace("120000", "1+2")],
    ["sufijo SQL", () => dump().replace("VALUES (", "VALUES (NOW(), ")],
    ["escape desconocido", () => dump().replace("'Servicio'", "'Servicio\\q'")],
  ])("rechaza %s", (_name, invalid) => {
    expect(parseLegacyDump(invalid()).ok).toBe(false);
  });
  it("rechaza IDs repetidos y columnas ausentes", () => {
    const data = legacy();
    data.actors.push({ ...data.actors[0]! });
    expect(parseLegacyDump(dump(data)).ok).toBe(false);
    const missing = legacy(); delete missing.items[0]!.amount;
    expect(parseLegacyDump(dump(missing)).ok).toBe(false);
  });
});

describe("conversión histórica a v2", () => {
  it("transforma estados y día civil de Colombia conservando el resto", () => {
    const data = legacy();
    const converted = unwrap(convertLegacy(data));
    expect(converted.actors).toEqual(data.actors);
    expect(converted.statements[0]).toEqual({ ...data.statements[0], status: "paid", pay_date: "2024-01-01" });
    expect(converted.items[0]).toEqual({ ...data.items[0], client_id: "client", status: "paid" });
    expect(data.statements[0]!.status).toBe("payed");
    expect(validateV2(converted)).toEqual({ ok: true, value: true });
  });
  it("conserva inactivos y vínculos, y no genera pendientes históricos", () => {
    const data = legacy(); data.statements[0]!.status = "pending"; data.statements[0]!.is_active = 0;
    data.items.push({ ...data.items[0]!, id: "inactive", is_active: 0, amount: 4000 });
    const converted = unwrap(convertLegacy(data));
    expect(converted.items.map((row) => row.status)).toEqual(["added", "added"]);
    expect(converted.items[1]).toMatchObject({ is_active: 0, amount: 4000, billing_statement_id: "account" });
  });
  it.each(["2024-02-29", "2024-03-01T00:30:00+00:00", "2024-02-29T23:30:00-05:00"])("maneja fechas sin depender de la zona del dispositivo: %s", (date) => {
    const data = legacy(); data.statements[0]!.pay_date = date;
    expect(unwrap(convertLegacy(data)).statements[0]!.pay_date).toBe("2024-02-29");
  });
  it.each([
    ["cuenta huérfana", (data: Dataset) => { data.items[0]!.billing_statement_id = "missing"; }],
    ["cliente ausente", (data: Dataset) => { data.statements[0]!.client_id = "missing"; }],
    ["actor equivocado", (data: Dataset) => { data.actors[0]!.type = "creditor"; }],
    ["propietario de ítem", (data: Dataset) => { data.items[0]!.owner_id = "other"; }],
    ["propietario de actor", (data: Dataset) => { data.actors[0]!.owner_id = "other"; }],
    ["total diferente", (data: Dataset) => { data.statements[0]!.amount = 1; }],
    ["estado desconocido", (data: Dataset) => { data.statements[0]!.status = "paid"; }],
    ["fecha inválida", (data: Dataset) => { data.statements[0]!.pay_date = "2024-02-30"; }],
    ["importe fraccionario", (data: Dataset) => { data.items[0]!.amount = 1.5; }],
    ["importe negativo", (data: Dataset) => { data.items[0]!.amount = -1; }],
    ["importe fuera de INT", (data: Dataset) => { data.items[0]!.amount = 2147483648; }],
    ["booleano inválido", (data: Dataset) => { data.actors[0]!.is_active = 2; }],
    ["timestamp inválido", (data: Dataset) => { data.items[0]!.created_at = "yesterday"; }],
  ])("bloquea %s", (_name, invalidate) => {
    const data = legacy(); invalidate(data);
    expect(convertLegacy(data).ok).toBe(false);
  });
  it("valida JSON v2 completo y rechaza claves extras o estados incoherentes", () => {
    const data = unwrap(convertLegacy(legacy()));
    expect(unwrap(parseV2Data(JSON.parse(JSON.stringify(data))))).toEqual(data);
    expect(parseV2Data({ ...data, unknown: [] }).ok).toBe(false);
    data.items[0]!.status = "added";
    expect(validateV2(data).ok).toBe(false);
  });
  it("acepta ítems nuevos pending sin cuenta en una instantánea v2", () => {
    const data = unwrap(convertLegacy(legacy()));
    data.items.push({ ...data.items[0]!, id: "pending", billing_statement_id: null, status: "pending", amount: 100 });
    expect(validateV2(data).ok).toBe(true);
  });
  it("genera huellas y resúmenes deterministas sin exponer datos personales", () => {
    const data = unwrap(convertLegacy(legacy()));
    const reordered = structuredClone(data); reordered.actors.reverse();
    reordered.items = reordered.items.map((row) => Object.fromEntries(Object.entries(row).reverse()));
    expect(canonicalize(reordered)).toEqual(canonicalize(data));
    expect(fingerprint(reordered)).toBe(fingerprint(data));
    const summary = summarize(data);
    expect(summary.counts).toEqual({ actors: 2, statements: 1, items: 1 });
    expect(JSON.stringify(summary)).not.toContain("Cliente");
    expect(JSON.stringify(summary)).not.toContain("owner");
    reordered.items[0]!.amount = 2;
    expect(fingerprint(reordered)).not.toBe(fingerprint(data));
  });
});
