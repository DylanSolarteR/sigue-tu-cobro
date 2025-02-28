import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { actor, billing_statement } from "@/server/db/schema";
import { eq, and, aliasedTable, desc } from "drizzle-orm";
import { billing_statement as billing_statement_type } from "@/types/billing-statement";

const billing_statement_Schema = z.object({
    id: z.string().optional(),
    client_id: z.string().nonempty({ message: "El Cliente es requerido" }),
    creditor_id: z.string().nonempty({ message: "El Acreedor es requerido" }),
    amount: z.number().optional(),
    extraInfo: z.string().optional(),
    showItemAmount: z.boolean().optional(),
    payDate: z.string(),
    status: z.enum(["payed", "pending"], { message: "Invalid status" }),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const billingStatementRouter = createTRPCRouter({
    queries: {
        getAll: privateProcedure.query(async ({ ctx }): Promise<billing_statement_type[]> => {
            const client = aliasedTable(actor, "client");
            const creditor = aliasedTable(actor, "creditor");
            const billingStatements = await ctx.db.select(
                {
                    id: billing_statement.id,
                    client_id: billing_statement.client_id,
                    client: {
                        id: client.id,
                        name: client.name,
                        docType: client.docType,
                        docNumber: client.docNumber,
                        expeditionPlace: client.expeditionPlace,
                        telephone: client.telephone,
                    },
                    creditor_id: billing_statement.creditor_id,
                    creditor: {
                        id: creditor.id,
                        name: creditor.name,
                        docType: creditor.docType,
                        docNumber: creditor.docNumber,
                        expeditionPlace: creditor.expeditionPlace,
                        telephone: creditor.telephone,
                    },
                    amount: billing_statement.amount,
                    status: billing_statement.status,
                    extraInfo: billing_statement.extraInfo,
                    payDate: billing_statement.payDate,
                    showItemAmount: billing_statement.showItemAmount,
                    createdAt: billing_statement.createdAt,
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
        getOne: privateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }): Promise<billing_statement_type> => {
            const client = aliasedTable(actor, "client");
            const creditor = aliasedTable(actor, "creditor");
            const billingStatement = await ctx.db.select(
                {
                    id: billing_statement.id,
                    client_id: billing_statement.client_id,
                    client: {
                        id: client.id,
                        name: client.name,
                        docType: client.docType,
                        docNumber: client.docNumber,
                        expeditionPlace: client.expeditionPlace,
                        telephone: client.telephone,
                    },
                    creditor_id: billing_statement.creditor_id,
                    creditor: {
                        id: creditor.id,
                        name: creditor.name,
                        docType: creditor.docType,
                        docNumber: creditor.docNumber,
                        expeditionPlace: creditor.expeditionPlace,
                        telephone: creditor.telephone,
                    },
                    amount: billing_statement.amount,
                    extraInfo: billing_statement.extraInfo,
                    showItemAmount: billing_statement.showItemAmount,
                    status: billing_statement.status,
                    payDate: billing_statement.payDate,
                    createdAt: billing_statement.createdAt,
                }
            ).from(billing_statement)
                .innerJoin(client, eq(billing_statement.client_id, client.id))
                .innerJoin(creditor, eq(billing_statement.creditor_id, creditor.id))
                .where(
                    and(
                        eq(billing_statement.isActive, true),
                        eq(billing_statement.ownerId, ctx.user.userId as string),
                        eq(billing_statement.id, input.id)
                    )
                );
            if (billingStatement.length === 0) {
                throw new Error("Cuenta de cobro no encontrada");
            }
            return billingStatement[0]!;
        }),
    },
    mutations: {
        create: privateProcedure.input(z.object({
            client_id: z.string().nonempty({ message: "El Cliente es requerido" }),
            creditor_id: z.string().nonempty({ message: "El Acreedor es requerido" }),
            payDate: z.string(),
        })).mutation(async ({ ctx, input }) => {
            console.log("Creating billing statement", input);
            const result = await ctx.db.insert(billing_statement).values({
                ownerId: ctx.user.userId as string,
                client_id: input.client_id,
                creditor_id: input.creditor_id,
                payDate: input.payDate,
                amount: 0,
                status: "pending",
                showItemAmount: true,
                isActive: true,
            }).$returningId()

            console.log("Created billing statement", result);
        }),
        update: privateProcedure.input(z.object({
            id: z.string(),
            amount: z.number(),
            status: z.enum(["payed", "pending"]),
            extraInfo: z.string().optional(),
            payDate: z.string(),
            showItemAmount: z.boolean().optional(),
        })).mutation(async ({ ctx, input }) => {
            console.log("Updating billing statement", input);
            await ctx.db.update(billing_statement).set({
                amount: input.amount,
                status: input.status,
                extraInfo: input.extraInfo ?? "",
                updatedAt: new Date().toISOString(),
                payDate: input.payDate,
                showItemAmount: input.showItemAmount ?? true,
            }).where(eq(billing_statement.id, input.id));
        }),
        updateAmount: privateProcedure.input(z.object({
            id: z.string(),
            amount: z.number(),
        })).mutation(async ({ ctx, input }) => {
            console.log("Updating billing statement amount", input);
            await ctx.db.update(billing_statement).set({
                amount: input.amount,
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
