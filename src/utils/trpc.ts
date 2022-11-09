import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../server/routers/_app";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>({});
export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});
