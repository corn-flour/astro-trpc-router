import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(async () => "hello from tRPC"),
});

export type AppRouter = typeof appRouter;
