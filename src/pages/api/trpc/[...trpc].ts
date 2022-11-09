import { initTRPC } from "@trpc/server";
import { createAstroApiHandler } from "../../../utils/create-astro-trpc-adapter";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(async () => "hello from tRPC"),
});

export type AppRouter = typeof appRouter;

export const all = createAstroApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
