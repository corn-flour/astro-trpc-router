import { AnyRouter, Dict, inferRouterContext, TRPCError } from "@trpc/server";
import type { APIRoute, APIContext } from "astro";
import type { HTTPRequest } from "@trpc/server/dist/http/internals/types";
import { resolveHTTPResponse } from "@trpc/server/http";

type CreateContextFn<TRouter extends AnyRouter> = (
  APIContext: APIContext
) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;

export function createAstroApiHandler<TRouter extends AnyRouter>(opts: {
  router: TRouter;
  createContext: CreateContextFn<TRouter>;
}): APIRoute {
  return async (ctx) => {
    function getPath(): string | null {
      if (typeof ctx.params.trpc === "string") {
        return ctx.params.trpc;
      }
      return null;
    }

    const path = getPath();
    if (path === null) {
      const error = opts.router.getErrorShape({
        error: new TRPCError({
          message:
            'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
          code: "INTERNAL_SERVER_ERROR",
        }),
        type: "unknown",
        ctx: undefined,
        path: undefined,
        input: undefined,
      });

      return new Response(
        JSON.stringify({
          id: -1,
          error,
        }),
        {
          status: 500,
        }
      );
    }
    const customRequest = ctx.request as Request & {
      headers: Dict<string | string[]>;
    };
    const customRequestUrl = new URL(customRequest.url);
    const req: HTTPRequest = {
      method: customRequest.method,
      headers: customRequest.headers,
      query: customRequestUrl.searchParams,
      body: await customRequest.text(),
    };

    const httpResponse = await resolveHTTPResponse({
      router: opts.router,
      req,
      path,
      createContext: async () => opts.createContext?.(ctx),
    });

    const { status, headers, body } = httpResponse as {
      status: number;
      headers: Record<string, string>;
      body: string;
    };

    return new Response(body, { status, headers });
  };
}
