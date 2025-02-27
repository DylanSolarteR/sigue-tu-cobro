import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { actor, billing_statement } from "@/server/db/schema";
import { eq, and, aliasedTable, desc } from "drizzle-orm";

const billing_statement_Schema = z.object({
    id: z.string().optional(),
    client_id: z.string(),
    creditor_id: z.string(),
    amount: z.number().optional(),
    status: z.enum(["payed", "pending"]),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const billingStatementRouter = createTRPCRouter({
    queries: {
        getAllBillingStatements: privateProcedure.query(async ({ ctx }) => {
            const client = aliasedTable(actor, "client");
            const creditor = aliasedTable(actor, "creditor");
            const billingStatements = await ctx.db.select(
                {
                    id: billing_statement.id,
                    client_id: billing_statement.client_id,
                    client_name: client.name,
                    creditor_id: billing_statement.creditor_id,
                    creditor_name: creditor.name,
                    amount: billing_statement.amount,
                    status: billing_statement.status,
                }
            ).from(billing_statement)
                .innerJoin(client, eq(billing_statement.client_id, client.id))
                .innerJoin(creditor, eq(billing_statement.creditor_id, creditor.id))
                .where(
                    and(
                        eq(billing_statement.isActive, true),
                        eq(billing_statement.ownerId, ctx.user.userId as string)
                    )
                ).orderBy(desc(billing_statement.updatedAt));
            return billingStatements;
        }),


    },
    mutations: {
        create: privateProcedure.input(billing_statement_Schema).mutation(async ({ ctx, input }) => {
            console.log("Creating billing statement", input);
            const result = await ctx.db.insert(billing_statement).values({
                ownerId: ctx.user.userId as string,
                client_id: input.client_id,
                creditor_id: input.creditor_id,
                amount: 0,
                status: "pending",
                isActive: true,
            }).$returningId()

            console.log("Created billing statement", result);
        }),
        update: privateProcedure.input(z.object({
            id: z.string(),
            client_id: z.string(),
            creditor_id: z.string(),
            amount: z.number(),
            status: z.enum(["payed", "pending"]),
        })).mutation(async ({ ctx, input }) => {
            console.log("Updating billing statement", input);
            await ctx.db.update(billing_statement).set({
                client_id: input.client_id,
                creditor_id: input.creditor_id,
                amount: input.amount,
                status: input.status,
                updatedAt: new Date().toISOString(),
            }).where(eq(billing_statement.id, input.id));
        }),
        delete: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
            console.log("Updating billing statement", input);
            await ctx.db.update(billing_statement).set({
                isActive: false,
            }).where(eq(billing_statement.id, input.id));
        }),

    }
});
