import { actorRouter } from "@/server/api/routers/actor";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { billingStatementRouter } from "./routers/billing-statement";
import { billingStatementItemRouter } from "./routers/billing-statement-item";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  actor: actorRouter,
  billing_statement: billingStatementRouter,
  billing_statement_item: billingStatementItemRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
