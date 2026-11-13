import { renderToBuffer } from "@react-pdf/renderer";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { z } from "zod";
import { BillingStatementPDF } from "@/components/generatePDF";
import { convertLegacy, parseV2Data, type Dataset } from "@/server/restore/historical";
import { privateDirectory } from "@/server/restore/artifacts";

vi.mock("@/actions/billing-statement.item.api", () => ({ getBillingStatementItems: vi.fn() }));
const ACTOR = z.object({ id: z.string(), name: z.string(), doc_type: z.enum(["CC", "CE", "NIT"]), doc_number: z.string() });
const ACCOUNT = z.object({ id: z.string(), client_id: z.string(), creditor_id: z.string(), amount: z.number(), show_item_amount: z.union([z.literal(0), z.literal(1)]), status: z.enum(["paid", "pending"]), pay_date: z.string(), extra_info: z.string() });
const ITEM = z.object({ id: z.string(), billing_statement_id: z.string(), client_id: z.string(), status: z.enum(["paid", "added"]), desc: z.string(), amount: z.number() });
function synthetic(): Dataset {
  const base = { owner_id: "owner", is_active: 1, created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" };
  const actors = ["client", "creditor"].map((type) => ({ ...base, id: type, name: "Persona de ejemplo", type, doc_type: "CC", doc_number: "12345", expedition_place: null, telephone: null }));
  const converted = convertLegacy({ actors, statements: [{ ...base, id: "account", client_id: "client", creditor_id: "creditor", amount: 125000, status: "payed", pay_date: "2026-01-02T00:00:00.000Z", extra_info: "", show_item_amount: 1 }], items: [{ ...base, id: "item", billing_statement_id: "account", desc: "Trabajo histórico", amount: 125000 }] });
  if (!converted.ok) throw new Error(converted.error);
  return converted.value;
}
it("genera un PDF válido desde una cuenta histórica convertida sin escribir en la base", async () => {
  const path = process.env.STC_RESTORE_PREPARED;
  let dataset = synthetic();
  if (path) {
    const parsed = parseV2Data(JSON.parse(await readFile(path, "utf8")) as unknown);
    if (!parsed.ok) throw new Error(parsed.error);
    dataset = parsed.value;
  }
  const raw = dataset.statements.find((row) => row.is_active === 1 && Number(row.amount) > 0);
  const account = ACCOUNT.parse(raw);
  const client = ACTOR.parse(dataset.actors.find((row) => row.id === account.client_id));
  const creditor = ACTOR.parse(dataset.actors.find((row) => row.id === account.creditor_id));
  const actor = (value: z.infer<typeof ACTOR>) => ({ name: value.name, docType: value.doc_type, docNumber: value.doc_number });
  const items = dataset.items.filter((row) => row.billing_statement_id === account.id && row.is_active === 1).map((row) => {
    const item = ITEM.parse(row);
    return { id: item.id, billing_statement_id: item.billing_statement_id, client_id: item.client_id, status: item.status, desc: item.desc, amount: item.amount };
  });
  expect(items.reduce((sum, item) => sum + item.amount, 0)).toBe(account.amount);
  const pdf = await renderToBuffer(<BillingStatementPDF data={{ id: account.id, client_id: account.client_id, creditor_id: account.creditor_id, client: actor(client), creditor: actor(creditor), amount: account.amount, status: account.status, showItemAmount: Boolean(account.show_item_amount), payDate: account.pay_date, extraInfo: account.extra_info }} items={items} />);
  expect(pdf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  expect(pdf.subarray(-32).toString("ascii")).toContain("%%EOF");
  expect(pdf.length).toBeGreaterThan(1000);
  if (path) {
    const output = await privateDirectory(resolve(dirname(path), "evidence"));
    await writeFile(resolve(output, "historical-account.pdf"), pdf, { flag: "wx", mode: 0o600 });
  }
}, 15000);
