import { cookies } from "next/headers";
import type { ReactNode } from "react";
import type { Actor } from "@/types/actor";
import { store, loadStore, saveStore } from "./store";

async function call<T>(name: string, operation: () => T): Promise<T> {
  if (!(await cookies()).get("stc-e2e-session")) throw new Error("E2E_MOCK_API_UNAUTHORIZED");
  const data = loadStore();
  if (data.delay) await new Promise((resolve) => setTimeout(resolve, data.delay));
  if (data.fault === name) throw new Error("Fallo simulado");
  loadStore();
  const result = structuredClone(operation());
  if (/\.(create|update|delete|status)$/.test(name)) saveStore();
  return result;
}
function actor(id: string) {
  const value = store().actors.find((entry) => entry.id === id);
  if (!value) throw new Error("Actor inexistente");
  return value;
}
function account(id: string) {
  const value = store().accounts.find((entry) => entry.id === id);
  if (!value) throw new Error("Cuenta inexistente");
  return value;
}
function item(id: string) {
  const value = store().items.find((entry) => entry.id === id);
  if (!value) throw new Error("Ítem inexistente");
  return value;
}
function actorMutations(type: "client" | "creditor") {
  return {
    create: (input: Actor) => call("actor.create", () => { const id = crypto.randomUUID(); store().actors.push({ ...input, id, type }); return id; }),
    update: (input: Actor & { id: string }) => call("actor.update", () => { Object.assign(actor(input.id), input); }),
    delete: ({ id }: { id: string }) => call("actor.delete", () => { store().actors = store().actors.filter((entry) => entry.id !== id); }),
  };
}
function setStatus(id: string, status: "pending" | "paid") {
  account(id).status = status;
  for (const entry of store().items) if (entry.billing_statement_id === id) entry.status = status === "paid" ? "paid" : "added";
}
export const api = {
  actor: {
    queries: {
      getClients: () => call("actor.list", () => store().actors.filter((entry) => entry.type === "client")),
      getCreditors: () => call("actor.list", () => store().actors.filter((entry) => entry.type === "creditor")),
      getClientById: ({ id }: { id: string }) => call("actor.get", () => actor(id)),
      getCreditorById: ({ id }: { id: string }) => call("actor.get", () => actor(id)),
    },
    mutations: { client: actorMutations("client"), creditor: actorMutations("creditor") },
  },
  billing_statement_item: {
    queries: {
      getPendingByClient: ({ client_id }: { client_id: string }) => call("item.list", () => store().items.filter((entry) => entry.client_id === client_id && entry.status === "pending")),
      getBillingStatementItems: ({ parentBillingStatementId }: { parentBillingStatementId: string }) => call("item.list", () => store().items.filter((entry) => entry.billing_statement_id === parentBillingStatementId)),
    },
    mutations: {
      create: (input: { client_id: string; desc: string; amount: number }) => call("item.create", () => { actor(input.client_id); const id = crypto.randomUUID(); store().items.push({ ...input, id, status: "pending", billing_statement_id: null }); return id; }),
      update: (input: { id: string; desc: string; amount: number }) => call("item.update", () => {
        const entry = item(input.id); if (entry.status === "paid") throw new Error("Cuenta pagada"); Object.assign(entry, input);
        if (entry.billing_statement_id) account(entry.billing_statement_id).amount = store().items.filter((other) => other.billing_statement_id === entry.billing_statement_id).reduce((sum, other) => sum + other.amount, 0);
      }),
      delete: ({ id }: { id: string }) => call("item.delete", () => { if (item(id).status !== "pending") throw new Error("Ítem añadido"); store().items = store().items.filter((entry) => entry.id !== id); }),
    },
  },
  billing_statement: {
    queries: {
      getAll: () => call("account.list", () => store().accounts),
      getOne: ({ id }: { id: string }) => call("account.get", () => account(id)),
      numberOfBillingStatements: () => call("stats", () => store().accounts.length),
      numberOfPayedBillingStatements: () => call("stats", () => store().accounts.filter((entry) => entry.status === "paid").length),
      numberOfPendingBillingStatements: () => call("stats", () => store().accounts.filter((entry) => entry.status === "pending").length),
      totalAmount: () => call("stats", () => store().accounts.reduce((sum, entry) => sum + (entry.amount ?? 0), 0)),
    },
    mutations: {
      create: (input: { client_id: string; creditor_id: string; item_ids: string[]; payDate: string }) => call("account.create", () => {
        const selected = input.item_ids.map(item);
        if (selected.some((entry) => entry.client_id !== input.client_id || entry.status !== "pending")) throw new Error("Ítems no elegibles");
        const id = crypto.randomUUID();
        store().accounts.unshift({ id, ...input, client: actor(input.client_id), creditor: actor(input.creditor_id), amount: selected.reduce((sum, entry) => sum + entry.amount, 0), status: "pending", extraInfo: "", showItemAmount: true, createdAt: "2026-11-11" });
        for (const entry of selected) { entry.billing_statement_id = id; entry.status = "added"; }
        return id;
      }),
      update: (input: { id: string; status: "pending" | "paid"; extraInfo: string; payDate: string; showItemAmount: boolean }) => call("account.update", () => { Object.assign(account(input.id), input); setStatus(input.id, input.status); }),
      updateStatus: ({ id, status }: { id: string; status: "pending" | "paid" }) => call("account.status", () => setStatus(id, status)),
      delete: ({ id }: { id: string }) => call("account.delete", () => {
        if (account(id).status === "paid") throw new Error("Cuenta pagada");
        store().accounts = store().accounts.filter((entry) => entry.id !== id);
        for (const entry of store().items) if (entry.billing_statement_id === id) { entry.billing_statement_id = null; entry.status = "pending"; }
      }),
    },
  },
};
export function HydrateClient({ children }: { children: ReactNode }) { return children; }
