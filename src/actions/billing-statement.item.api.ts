'use server';

import { z } from "zod";
import { api } from "@/trpc/server";
import type { ActionResponse } from "@/types/actionResponses";
import type { billing_statement_item } from "@/types/billing-statement";

const itemInput = z.object({
  client_id: z.string().min(1),
  desc: z.string().trim().min(1).max(150),
  amount: z.number().int().positive().max(2147483647),
});

export async function getPendingItemsByClient(client_id: string): Promise<ActionResponse<billing_statement_item[]>> {
  if (!z.string().min(1).safeParse(client_id).success) return { success: false, message: "Seleccione un cliente válido." };
  try {
    const data = await api.billing_statement_item.queries.getPendingByClient({ client_id });
    return { success: true, message: "Ítems pendientes obtenidos.", data };
  } catch {
    return { success: false, message: "No se pudieron cargar los ítems pendientes." };
  }
}

export async function getBillingStatementItems(parentBillingStatementId: string): Promise<ActionResponse<billing_statement_item[]>> {
  if (!z.string().min(1).safeParse(parentBillingStatementId).success) return { success: false, message: "La cuenta no es válida." };
  try {
    const data = await api.billing_statement_item.queries.getBillingStatementItems({ parentBillingStatementId });
    return { success: true, message: "Ítems obtenidos.", data };
  } catch {
    return { success: false, message: "No se pudieron cargar los ítems de la cuenta." };
  }
}

export async function createPendingItem(client_id: string, desc: string, amount: number): Promise<ActionResponse<{ id: string }>> {
  const result = itemInput.safeParse({ client_id, desc, amount });
  if (!result.success) return { success: false, message: "Seleccione un cliente e ingrese una descripción y un valor entero mayor que cero." };
  try {
    const id = await api.billing_statement_item.mutations.create(result.data);
    return { success: true, message: "Ítem creado", data: { id } };
  } catch {
    return { success: false, message: "No se pudo crear el ítem." };
  }
}

export async function updateBillingStatementItem(id: string, desc: string, amount: number): Promise<ActionResponse<billing_statement_item>> {
  const result = itemInput.omit({ client_id: true }).extend({ id: z.string().min(1) }).safeParse({ id, desc, amount });
  if (!result.success) return { success: false, message: "Ingrese una descripción y un valor entero mayor que cero." };
  try {
    await api.billing_statement_item.mutations.update(result.data);
    return { success: true, message: "Ítem actualizado." };
  } catch {
    return { success: false, message: "No se pudo actualizar el ítem. Verifique que la cuenta esté pendiente." };
  }
}

export async function deleteBillingStatementItem(id: string): Promise<ActionResponse<billing_statement_item>> {
  if (!z.string().min(1).safeParse(id).success) return { success: false, message: "El ítem no es válido." };
  try {
    await api.billing_statement_item.mutations.delete({ id });
    return { success: true, message: "Ítem eliminado." };
  } catch {
    return { success: false, message: "No se pudo eliminar el ítem." };
  }
}
