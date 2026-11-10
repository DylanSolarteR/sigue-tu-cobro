import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, sum } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { actor, billing_statement, billing_statement_item } from "@/server/db/schema";

const id = z.string().min(1);
const description = z.string().trim().min(1, "La descripción es requerida").max(150);
const amount = z.number().int().positive().max(2147483647);

export const billingStatementItemRouter = createTRPCRouter({
  queries: {
    getBillingStatementItems: privateProcedure.input(z.object({ parentBillingStatementId: id })).query(async ({ ctx, input }) => {
      return ctx.db.select().from(billing_statement_item).where(and(
        eq(billing_statement_item.ownerId, ctx.user.userId!),
        eq(billing_statement_item.billing_statement_id, input.parentBillingStatementId),
        eq(billing_statement_item.isActive, true),
      )).orderBy(billing_statement_item.updatedAt);
    }),
    getPendingByClient: privateProcedure.input(z.object({ client_id: id })).query(async ({ ctx, input }) => {
      return ctx.db.select().from(billing_statement_item).where(and(
        eq(billing_statement_item.ownerId, ctx.user.userId!), eq(billing_statement_item.client_id, input.client_id),
        eq(billing_statement_item.status, "pending"), eq(billing_statement_item.isActive, true),
      )).orderBy(billing_statement_item.updatedAt);
    }),
  },
  mutations: {
    create: privateProcedure.input(z.object({ client_id: id, desc: description, amount })).mutation(async ({ ctx, input }) => {
      const owner = ctx.user.userId!;
      const [client] = await ctx.db.select({ id: actor.id }).from(actor).where(and(
        eq(actor.id, input.client_id), eq(actor.ownerId, owner), eq(actor.type, "client"), eq(actor.isActive, true),
      ));
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
      const item_id = crypto.randomUUID();
      await ctx.db.insert(billing_statement_item).values({ id: item_id, ownerId: owner, client_id: input.client_id, desc: input.desc, amount: input.amount, status: "pending", billing_statement_id: null });
      return item_id;
    }),
    update: privateProcedure.input(z.object({ id, desc: description, amount })).mutation(async ({ ctx, input }) => {
      const owner = ctx.user.userId!;
      await ctx.db.transaction(async (tx) => {
        const [initial] = await tx.select().from(billing_statement_item).where(and(eq(billing_statement_item.id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true)));
        if (!initial) throw new TRPCError({ code: "NOT_FOUND", message: "Ítem no encontrado" });
        if (initial.billing_statement_id) {
          const [statement] = await tx.select().from(billing_statement).where(and(eq(billing_statement.id, initial.billing_statement_id), eq(billing_statement.ownerId, owner), eq(billing_statement.isActive, true))).for("update");
          if (!statement || statement.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Reabre la cuenta antes de editar sus ítems" });
        }
        const [item] = await tx.select().from(billing_statement_item).where(and(eq(billing_statement_item.id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true))).for("update");
        if (!item || item.billing_statement_id !== initial.billing_statement_id || item.status === "paid") throw new TRPCError({ code: "CONFLICT", message: "El ítem cambió; vuelve a intentarlo" });
        await tx.update(billing_statement_item).set({ desc: input.desc, amount: input.amount, updatedAt: new Date().toISOString() }).where(and(eq(billing_statement_item.id, input.id), eq(billing_statement_item.ownerId, owner)));
        if (item.billing_statement_id) {
          const [total] = await tx.select({ value: sum(billing_statement_item.amount) }).from(billing_statement_item).where(and(eq(billing_statement_item.billing_statement_id, item.billing_statement_id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true)));
          const value = Number(total?.value ?? 0);
          if (!Number.isSafeInteger(value) || value > 2147483647) throw new TRPCError({ code: "BAD_REQUEST", message: "El total de la cuenta no es válido" });
          await tx.update(billing_statement).set({ amount: value, updatedAt: new Date().toISOString() }).where(and(eq(billing_statement.id, item.billing_statement_id), eq(billing_statement.ownerId, owner)));
        }
      });
    }),
    delete: privateProcedure.input(z.object({ id })).mutation(async ({ ctx, input }) => {
      const owner = ctx.user.userId!;
      await ctx.db.transaction(async (tx) => {
        const [item] = await tx.select().from(billing_statement_item).where(and(eq(billing_statement_item.id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true))).for("update");
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Ítem no encontrado" });
        if (item.billing_statement_id || item.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Solo se pueden eliminar ítems pendientes" });
        await tx.update(billing_statement_item).set({ isActive: false, updatedAt: new Date().toISOString() }).where(and(eq(billing_statement_item.id, input.id), eq(billing_statement_item.ownerId, owner)));
      });
    }),
  },
});
