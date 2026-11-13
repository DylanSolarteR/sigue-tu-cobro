import type { Actor } from "@/types/actor";
import type { billing_statement, billing_statement_item } from "@/types/billing-statement";
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";

type Store = { actors: Actor[]; accounts: billing_statement[]; items: billing_statement_item[]; fault: string; delay: number };
const globalStore = globalThis as typeof globalThis & { stcE2EStore?: Store; stcE2EStamp?: string };
const stateFile = () => path.resolve(".next-e2e/fixtures.json");
function stamp() { const stat = statSync(stateFile(), { bigint: true }); return `${stat.mtimeNs}:${stat.size}`; }
export function saveStore() { writeFileSync(stateFile(), JSON.stringify(store())); globalStore.stcE2EStamp = stamp(); }
export function loadStore() {
  if (existsSync(stateFile())) {
    const version = stamp();
    if (!globalStore.stcE2EStore || globalStore.stcE2EStamp !== version) {
      globalStore.stcE2EStore = JSON.parse(readFileSync(stateFile(), "utf8")) as Store;
      globalStore.stcE2EStamp = version;
    }
  } else resetStore();
  return store();
}
export function resetStore(accounts = 12, pending = 3) {
  const actors: Actor[] = Array.from({ length: 20 }, (_, index) => ({ id: `client-${index + 1}`, name: `Cliente ${String(index + 1).padStart(2, "0")} con nombre extenso de prueba`, docType: "CC", docNumber: `10000${index}`, type: "client", telephone: "3001234567", expeditionPlace: "Bogotá" }));
  actors.push({ id: "creditor-1", name: "Acreedor de prueba", docType: "NIT", docNumber: "900123456", type: "creditor" });
  const items: billing_statement_item[] = Array.from({ length: pending }, (_, index) => ({ id: `pending-${index + 1}`, billing_statement_id: null, client_id: "client-1", status: "pending", amount: 10000, desc: `Concepto pendiente ${String(index + 1).padStart(4, "0")} con una descripción extensa que debe ajustarse correctamente` }));
  const statements: billing_statement[] = Array.from({ length: accounts }, (_, index) => {
    const client = actors[index % 20]!;
    const id = `account-${index + 1}`;
    const paid = index % 3 === 0;
    items.push({ id: `added-${index + 1}`, billing_statement_id: id, client_id: client.id!, status: paid ? "paid" : "added", amount: 10000, desc: `Trabajo incluido ${index + 1}` });
    return { id, client_id: client.id!, creditor_id: "creditor-1", client, creditor: actors[20]!, amount: 10000, status: paid ? "paid" : "pending", payDate: `2026-${String(index % 12 + 1).padStart(2, "0")}-15`, extraInfo: "Datos ficticios E2E", showItemAmount: true, createdAt: "2026-01-01" };
  });
  globalStore.stcE2EStore = { actors, items, accounts: statements, fault: "", delay: 0 };
  saveStore();
  return globalStore.stcE2EStore;
}
export function store() { return globalStore.stcE2EStore ?? resetStore(); }
export function identity() { return process.env.E2E_USER_ID ?? "user_e2e_synthetic"; }
