import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { billing_statement_item } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

const billing_statement_item_Schema = z.object({
    billing_statement_id: z.string(),
    desc: z.string().min(1, { message: "La descripción es requerida" }),
    amount: z.number(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const billingStatementItemRouter = createTRPCRouter({
    queries: {

        getBillingStatementItems: privateProcedure.input(z.object({ parentBillingStatementId: z.string() })).query(async ({ ctx, input }) => {
            const billingStatementItems = await ctx.db.select().from(billing_statement_item).where(
                and(
                    eq(billing_statement_item.isActive, true),
                    eq(billing_statement_item.billing_statement_id, input.parentBillingStatementId),
                    eq(billing_statement_item.ownerId, ctx.user.userId as string)
                )
            ).orderBy(billing_statement_item.updatedAt);
            if (billingStatementItems.length === 0) {
                throw new Error("No billing statement items found");
            }
            return billingStatementItems;
        }),


    },
    mutations: {
        create: privateProcedure.input(billing_statement_item_Schema).mutation(async ({ ctx, input }) => {
            const result = await ctx.db.insert(billing_statement_item).values({
                billing_statement_id: input.billing_statement_id,
                desc: input.desc,
                ownerId: ctx.user.userId as string,
                amount: input.amount,
                isActive: true,
            }).$returningId()
            return result[0]?.id;
        }),
        update: privateProcedure.input(z.object({
            id: z.string(),
            amount: z.number(),
            desc: z.string().min(1, { message: "La descripción es requerida" }),
        })).mutation(async ({ ctx, input }) => {
            await ctx.db.update(billing_statement_item).set({
                amount: input.amount,
                desc: input.desc,
                updatedAt: new Date().toISOString(),
            }).where(eq(billing_statement_item.id, input.id));
        }),
        delete: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
            await ctx.db.update(billing_statement_item).set({
                isActive: false,
            }).where(eq(billing_statement_item.id, input.id));
        }),

    }
});
