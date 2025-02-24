import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { client } from "@/server/db/schema";

export const clientRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name: z.string().min(1), docType: z.enum(["CC", "CE", "NIT"]), docNumber: z.string() }))
        .mutation(async ({ ctx, input }) => {
            console.log("Creating client", input);
            const result = await ctx.db.insert(client).values({
                name: input.name,
                docType: input.docType,
                docNumber: input.docNumber,
            }).$returningId()

            console.log("Created client", result);
        }),

});
