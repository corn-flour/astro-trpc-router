import { appRouter } from "../../../server/server";
import { createAstroApiHandler } from "../../../utils/create-astro-trpc-adapter";

export const all = createAstroApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
