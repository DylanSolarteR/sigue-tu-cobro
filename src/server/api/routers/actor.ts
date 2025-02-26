import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { actor } from "@/server/db/schema";

const actorSchema = z.object({
    id: z.string(),
    name: z.string(),
    docType: z.enum(["CC", "CE", "NIT"]),
    docNumber: z.string(),
    type: z.enum(["client", "collector"]),
    expeditionPlace: z.string().optional(),
    telephone: z.string().optional(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const actorRouter = createTRPCRouter({
    createClient: publicProcedure
        .input(actorSchema)
        .mutation(async ({ ctx, input }) => {
            console.log("Creating actor: client", input);
            const result = await ctx.db.insert(actor).values({
                name: input.name,
                docType: input.docType,
                docNumber: input.docNumber,
                type: "client",
            }).$returningId()

            console.log("Created client", result);
        }),
    createCollector: publicProcedure
        .input(actorSchema)
        .mutation(async ({ ctx, input }) => {
            console.log("Creating actor: collector", input);
            const result = await ctx.db.insert(actor).values({
                name: input.name,
                docType: input.docType,
                docNumber: input.docNumber,
                type: "collector",
            }).$returningId()

            console.log("Created collector", result);
        }),
});
