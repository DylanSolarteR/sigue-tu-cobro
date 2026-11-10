import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { actor, billing_statement, billing_statement_item } from "@/server/db/schema";
import { eq, and, aliasedTable, desc, sum, inArray, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { billingDateSchema } from "@/lib/billing-date";
import { itemStatusForStatement, validateSelection } from "@/server/api/billing-domain";
import { billing_statement as billing_statement_type } from "@/types/billing-statement";

const billing_statement_Schema = z.object({
    id: z.string().optional(),
    client_id: z.string().nonempty({ message: "El Cliente es requerido" }),
    creditor_id: z.string().nonempty({ message: "El Acreedor es requerido" }),
    amount: z.number().optional(),
    extraInfo: z.string().optional(),
    showItemAmount: z.boolean().optional(),
    payDate: z.string(),
    status: z.enum(["paid", "pending"], { message: "Invalid status" }),
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
                .innerJoin(client, and(eq(billing_statement.client_id, client.id), eq(client.ownerId, billing_statement.ownerId), eq(client.type, "client")))
                .innerJoin(creditor, and(eq(billing_statement.creditor_id, creditor.id), eq(creditor.ownerId, billing_statement.ownerId), eq(creditor.type, "creditor")))
                .where(
                    and(
                        eq(billing_statement.isActive, true),
                        eq(billing_statement.ownerId, ctx.user.userId as string)
                    )
                ).orderBy(desc(billing_statement.createdAt));
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
                .innerJoin(client, and(eq(billing_statement.client_id, client.id), eq(client.ownerId, billing_statement.ownerId), eq(client.type, "client")))
                .innerJoin(creditor, and(eq(billing_statement.creditor_id, creditor.id), eq(creditor.ownerId, billing_statement.ownerId), eq(creditor.type, "creditor")))
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
        numberOfBillingStatements: privateProcedure.query(async ({ ctx }) => {
            const count = await ctx.db.$count(billing_statement,
                and(
                    eq(billing_statement.isActive, true),
                    eq(billing_statement.ownerId, ctx.user.userId as string)
                )
            );
            return count;
        }),
        numberOfPendingBillingStatements: privateProcedure.query(async ({ ctx }) => {
            const count = await ctx.db.$count(billing_statement,
                and(
                    eq(billing_statement.isActive, true),
                    eq(billing_statement.ownerId, ctx.user.userId as string),
                    eq(billing_statement.status, "pending")
                )
            );
            return count;
        }),
        numberOfPayedBillingStatements: privateProcedure.query(async ({ ctx }) => {
            const count = await ctx.db.$count(billing_statement,
                and(
                    eq(billing_statement.isActive, true),
                    eq(billing_statement.ownerId, ctx.user.userId as string),
                    eq(billing_statement.status, "paid")
                )
            );
            return count;
        }
        ),
        totalAmount: privateProcedure.query(async ({ ctx }) => {
            const total = await ctx.db.select({ value: sum(billing_statement.amount) }).from(billing_statement)
                .where(
                    and(
                        eq(billing_statement.isActive, true),
                        eq(billing_statement.ownerId, ctx.user.userId as string)
                    )
                );
            return total[0]?.value ?? 0;
        }),

    },
    mutations: {
        create: privateProcedure.input(z.object({
            client_id: z.string().nonempty({ message: "El Cliente es requerido" }),
            creditor_id: z.string().nonempty({ message: "El Acreedor es requerido" }),
            payDate: billingDateSchema,
            item_ids: z.array(z.string().min(1)).min(1),
        })).mutation(async ({ ctx, input }) => {
            const owner = ctx.user.userId!;
            return ctx.db.transaction(async (tx) => {
                const parties = await tx.select({ id: actor.id, type: actor.type }).from(actor).where(and(
                    eq(actor.ownerId, owner), eq(actor.isActive, true), inArray(actor.id, [input.client_id, input.creditor_id]),
                ));
                if (!parties.some(p => p.id === input.client_id && p.type === "client") || !parties.some(p => p.id === input.creditor_id && p.type === "creditor")) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Cliente o acreedor no disponible" });
                }
                const items = await tx.select().from(billing_statement_item).where(inArray(billing_statement_item.id, input.item_ids)).orderBy(asc(billing_statement_item.id)).for("update");
                const selection = validateSelection(items, input.item_ids, owner, input.client_id);
                if (!selection.ok) throw new TRPCError({ code: "CONFLICT", message: selection.error });
                const id = crypto.randomUUID();
                await tx.insert(billing_statement).values({ id, ownerId: owner, client_id: input.client_id, creditor_id: input.creditor_id, payDate: input.payDate, amount: selection.value, status: "pending", showItemAmount: true, isActive: true });
                await tx.update(billing_statement_item).set({ billing_statement_id: id, status: "added", updatedAt: new Date().toISOString() }).where(and(eq(billing_statement_item.ownerId, owner), inArray(billing_statement_item.id, input.item_ids)));
                return id;
            });
        }),
        update: privateProcedure.input(z.object({
            id: z.string(),
            status: z.enum(["paid", "pending"]),
            extraInfo: z.string().optional(),
            payDate: billingDateSchema,
            showItemAmount: z.boolean().optional(),
        })).mutation(async ({ ctx, input }) => {
            const owner = ctx.user.userId!;
            await ctx.db.transaction(async (tx) => {
                const [statement] = await tx.select().from(billing_statement).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner), eq(billing_statement.isActive, true))).for("update");
                if (!statement) throw new TRPCError({ code: "NOT_FOUND", message: "Cuenta no encontrada" });
                await tx.update(billing_statement).set({ status: input.status, extraInfo: input.extraInfo ?? "", updatedAt: new Date().toISOString(), payDate: input.payDate, showItemAmount: input.showItemAmount ?? true }).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner)));
                await tx.update(billing_statement_item).set({ status: itemStatusForStatement(input.status), updatedAt: new Date().toISOString() }).where(and(eq(billing_statement_item.billing_statement_id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true)));
            });
        }),
        updateStatus: privateProcedure.input(z.object({ id: z.string().min(1), status: z.enum(["paid", "pending"]) })).mutation(async ({ ctx, input }) => {
            const owner = ctx.user.userId!;
            await ctx.db.transaction(async (tx) => {
                const [statement] = await tx.select().from(billing_statement).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner), eq(billing_statement.isActive, true))).for("update");
                if (!statement) throw new TRPCError({ code: "NOT_FOUND", message: "Cuenta no encontrada" });
                const updatedAt = new Date().toISOString();
                await tx.update(billing_statement).set({ status: input.status, updatedAt }).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner)));
                await tx.update(billing_statement_item).set({ status: itemStatusForStatement(input.status), updatedAt }).where(and(eq(billing_statement_item.billing_statement_id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true)));
            });
        }),
        delete: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
            const owner = ctx.user.userId!;
            await ctx.db.transaction(async (tx) => {
                const [statement] = await tx.select().from(billing_statement).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner), eq(billing_statement.isActive, true))).for("update");
                if (!statement) throw new TRPCError({ code: "NOT_FOUND", message: "Cuenta no encontrada" });
                if (statement.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Reabre la cuenta antes de eliminarla" });
                await tx.update(billing_statement_item).set({ billing_statement_id: null, status: "pending", updatedAt: new Date().toISOString() }).where(and(eq(billing_statement_item.billing_statement_id, input.id), eq(billing_statement_item.ownerId, owner), eq(billing_statement_item.isActive, true)));
                await tx.update(billing_statement).set({ isActive: false, updatedAt: new Date().toISOString() }).where(and(eq(billing_statement.id, input.id), eq(billing_statement.ownerId, owner)));
            });
        }),

    }
});
