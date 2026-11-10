export type ItemStatus = "pending" | "added" | "paid";
export type StatementStatus = "pending" | "paid";
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

type SelectionItem = {
  id: string;
  ownerId: string;
  client_id: string;
  status: ItemStatus;
  billing_statement_id: string | null;
  isActive: boolean;
  amount: number;
};

export function validateSelection(items: SelectionItem[], ids: string[], owner: string, client: string): Result<number> {
  if (!ids.length || new Set(ids).size !== ids.length || items.length !== ids.length) {
    return { ok: false, error: "Selecciona ítems pendientes válidos" };
  }
  const requested = new Set(ids);
  if (items.some((item) => !requested.has(item.id) || item.ownerId !== owner || item.client_id !== client || !item.isActive || item.status !== "pending" || item.billing_statement_id !== null)) {
    return { ok: false, error: "Uno o más ítems ya no están disponibles" };
  }
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (!Number.isSafeInteger(total) || total > 2147483647 || total < 0) {
    return { ok: false, error: "El total de la cuenta no es válido" };
  }
  return { ok: true, value: total };
}

export function itemStatusForStatement(status: StatementStatus): ItemStatus {
  return status === "paid" ? "paid" : "added";
}
