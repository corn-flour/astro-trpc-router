import { z } from "zod";
import { publicProcedure, router } from "../server";

type Post = {
  id: number;
  title: string;
  body: string;
};

export const appRouter = router({
  hello: publicProcedure.query(async () => "hello from tRPC"),
  posts: publicProcedure.query(async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = (await res.json()) as Post[];
    return data.slice(0, 10);
  }),
  post: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${input.id}`
      );
      return (await res.json()) as Post;
    }),
});
export type AppRouter = typeof appRouter;
