import { appRouter } from "../../../server/routers/_app";
import { createAstroApiHandler } from "../../../utils/create-astro-trpc-adapter";

export const all = createAstroApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
