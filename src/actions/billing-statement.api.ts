'use server';

import { z } from "zod";
import { api } from "@/trpc/server";
import type { ActionResponse } from "@/types/actionResponses";
import type { billing_statement, billing_statement_item } from "@/types/billing-statement";
import { billingDateSchema } from "@/lib/billing-date";

const createSchema = z.object({
  client_id: z.string().min(1), creditor_id: z.string().min(1),
  payDate: billingDateSchema, item_ids: z.array(z.string().min(1)).min(1),
});

export async function getStatistics() {
  try {
    const [numberOfBillingStatements, numberOfPayedBillingStatements, numberOfPendingBillingStatements, totalAmount] = await Promise.all([
      api.billing_statement.queries.numberOfBillingStatements(), api.billing_statement.queries.numberOfPayedBillingStatements(),
      api.billing_statement.queries.numberOfPendingBillingStatements(), api.billing_statement.queries.totalAmount(),
    ]);
    return { success: true, message: "Estadísticas obtenidas correctamente", data: { numberOfBillingStatements, numberOfPayedBillingStatements, numberOfPendingBillingStatements, totalAmount } };
  } catch { return { success: false, message: "Error al obtener estadísticas" }; }
}

export async function getBillingStatements(): Promise<ActionResponse<billing_statement[]>> {
  try { return { success: true, message: "Cuentas obtenidas.", data: await api.billing_statement.queries.getAll() }; }
  catch { return { success: false, message: "No se pudieron obtener las cuentas." }; }
}
export async function getBillingStatement(id: string): Promise<ActionResponse<billing_statement>> {
  if (!z.string().min(1).safeParse(id).success) return { success: false, message: "La cuenta no es válida." };
  try { return { success: true, message: "Cuenta obtenida.", data: await api.billing_statement.queries.getOne({ id }) }; }
  catch { return { success: false, message: "No se pudo obtener la cuenta." }; }
}

export async function getBillingStatementDetails(id: string): Promise<ActionResponse<{ account: billing_statement; items: billing_statement_item[] }>> {
  if (!z.string().min(1).safeParse(id).success) return { success: false, message: "La cuenta no es válida." };
  try {
    // Browser-triggered server actions are queued; combine these reads into one round trip.
    const [account, items] = await Promise.all([
      api.billing_statement.queries.getOne({ id }),
      api.billing_statement_item.queries.getBillingStatementItems({ parentBillingStatementId: id }),
    ]);
    return { success: true, message: "Detalles obtenidos.", data: { account, items } };
  } catch { return { success: false, message: "No se pudieron obtener los detalles de la cuenta." }; }
}

export async function createBillingStatement(input: z.infer<typeof createSchema>): Promise<ActionResponse<{ id: string }>> {
  const result = createSchema.safeParse(input);
  if (!result.success) return { success: false, message: "Seleccione cliente, acreedor y al menos un ítem pendiente." };
  try {
    const id = await api.billing_statement.mutations.create(result.data);
    return { success: true, message: "Cuenta de cobro creada.", data: { id } };
  } catch { return { success: false, message: "No se pudo crear la cuenta. Verifique que los ítems sigan pendientes." }; }
}

const updateSchema = z.object({
  id: z.string().min(1), status: z.enum(["pending", "paid"]), extraInfo: z.string().max(2000),
  payDate: billingDateSchema, showItemAmount: z.boolean(),
});
export async function saveBillingStatement(input: z.infer<typeof updateSchema>): Promise<ActionResponse<{ id: string }>> {
  const result = updateSchema.safeParse(input);
  if (!result.success) return { success: false, message: "Revise los datos de la cuenta." };
  try {
    await api.billing_statement.mutations.update(result.data);
    return { success: true, message: "Cuenta actualizada.", data: { id: result.data.id } };
  } catch { return { success: false, message: "No se pudo actualizar la cuenta." }; }
}

export async function updateBillingStatementStatus(id: string, status: "pending" | "paid"): Promise<ActionResponse<{ id: string }>> {
  const result = z.object({ id: z.string().min(1), status: z.enum(["pending", "paid"]) }).safeParse({ id, status });
  if (!result.success) return { success: false, message: "La cuenta o el estado no son válidos." };
  try {
    await api.billing_statement.mutations.updateStatus(result.data);
    return { success: true, message: "Estado actualizado.", data: { id: result.data.id } };
  } catch { return { success: false, message: "No se pudo actualizar el estado." }; }
}

export async function deleteBillingstatement(id: string): Promise<ActionResponse<billing_statement>> {
  if (!z.string().min(1).safeParse(id).success) return { success: false, message: "La cuenta no es válida." };
  try { await api.billing_statement.mutations.delete({ id }); return { success: true, message: "Cuenta eliminada." }; }
  catch { return { success: false, message: "No se pudo eliminar la cuenta. Verifique su estado." }; }
}
