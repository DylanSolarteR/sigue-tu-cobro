import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { client } from "@/server/db/schema";

export const clientRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(client).values({
                name: input.name,
                docType: "CC",
                docNumber: "123456789",
            });
        }),

});
