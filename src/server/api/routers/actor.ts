import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import { actor } from "@/server/db/schema";
import { and, desc, eq } from "drizzle-orm";

const actorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    docType: z.enum(["CC", "CE", "NIT"], {
        errorMap: () => ({ message: 'Tipo de documento invalido.' })
    }),
    docNumber: z.string().min(5, "El número de documento debe tener al menos 5 caracteres"),
    type: z.enum(["client", "creditor"], {
        errorMap: () => ({ message: 'Tipo de actor invalido.' })
    }),
    expeditionPlace: z.string().optional(),
    telephone: z.string().optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const actorRouter = createTRPCRouter({
    queries: {
        getClients: privateProcedure.query(async ({ ctx }) => {
            const clients = await ctx.db.select().from(actor).where(
                and(
                    eq(actor.type, "client"),
                    eq(actor.isActive, true),
                    eq(actor.ownerId, ctx.user.userId as string)
                )
            ).orderBy(desc(actor.updatedAt));
            return clients;
        }),
        getClientById: privateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
            const client = await ctx.db.select().from(actor).where(
                and(
                    eq(actor.id, input.id),
                    eq(actor.type, "client"),
                    eq(actor.ownerId, ctx.user.userId as string)
                )
            );
            if (client.length === 0) {
                throw new Error("Client not found");
            }
            return client[0];
        }),
        getCreditors: privateProcedure.query(async ({ ctx }) => {
            const creditors = await ctx.db.select().from(actor).where(
                and(
                    eq(actor.type, "creditor"),
                    eq(actor.isActive, true),
                    eq(actor.ownerId, ctx.user.userId as string)
                )
            ).orderBy(desc(actor.updatedAt));
            return creditors;
        }),
        getCreditorById: privateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
            const creditor = await ctx.db.select().from(actor).where(
                and(
                    eq(actor.id, input.id),
                    eq(actor.type, "creditor"),
                    eq(actor.ownerId, ctx.user.userId as string)
                )
            );
            if (creditor.length === 0) {
                throw new Error("Creditor not found");
            }
            return creditor[0];
        }),
    },
    mutations: {
        client: {

            create: privateProcedure
                .input(actorSchema)
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.insert(actor).values({
                        name: input.name,
                        ownerId: ctx.user.userId as string,
                        docType: input.docType,
                        docNumber: input.docNumber,
                        telephone: input.telephone,
                        expeditionPlace: input.expeditionPlace,
                        type: "client",
                    }).$returningId()

                }),
            update: privateProcedure
                .input(z.object({
                    id: z.string(),
                    name: z.string(),
                    docType: z.enum(["CC", "CE", "NIT"]),
                    docNumber: z.string(),
                    expeditionPlace: z.string().optional(),
                    telephone: z.string().optional(),
                })
                )
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.update(actor).set({
                        name: input.name,
                        docType: input.docType,
                        docNumber: input.docNumber,
                        expeditionPlace: input.expeditionPlace,
                        telephone: input.telephone,
                    }).where(
                        and(
                            eq(actor.id, input.id),
                            eq(actor.type, "client"),
                            eq(actor.ownerId, ctx.user.userId as string)
                        )
                    )

                }),
            delete: privateProcedure
                .input(z.object({ id: z.string() }))
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.update(actor).set({
                        isActive: false
                    }).where(
                        and(
                            eq(actor.id, input.id),
                            eq(actor.type, "client"),
                            eq(actor.ownerId, ctx.user.userId as string)
                        )
                    )
                }),
        },
        creditor: {

            create: privateProcedure
                .input(actorSchema)
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.insert(actor).values({
                        name: input.name,
                        ownerId: ctx.user.userId as string,
                        docType: input.docType,
                        docNumber: input.docNumber,
                        telephone: input.telephone,
                        expeditionPlace: input.expeditionPlace,
                        type: "creditor",
                    }).$returningId()

                }),
            update: privateProcedure
                .input(z.object({
                    id: z.string(),
                    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
                    docType: z.enum(["CC", "CE", "NIT"], {
                        errorMap: () => ({ message: 'Seleccione un tipo de documento.' })
                    }),
                    docNumber: z.string().min(5, "El número de documento debe tener al menos 5 caracteres"),
                    expeditionPlace: z.string().optional(),
                    telephone: z.string().optional(),
                })
                )
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.update(actor).set({
                        name: input.name,
                        docType: input.docType,
                        docNumber: input.docNumber,
                        expeditionPlace: input.expeditionPlace,
                        telephone: input.telephone,
                    }).where(
                        and(
                            eq(actor.id, input.id),
                            eq(actor.type, "creditor"),
                            eq(actor.ownerId, ctx.user.userId as string)
                        )
                    )

                }),
            delete: privateProcedure
                .input(z.object({ id: z.string() }))
                .mutation(async ({ ctx, input }) => {
                    const result = await ctx.db.update(actor).set({
                        isActive: false
                    }).where(
                        and(
                            eq(actor.id, input.id),
                            eq(actor.type, "creditor"),
                            eq(actor.ownerId, ctx.user.userId as string)
                        )
                    )

                }),
        }
    }
});
