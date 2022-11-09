import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { client, trpc } from "../utils/trpc";
import {
  createReactRouter,
  createRouteConfig,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient();

const App = () => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>
          <div className="max-w-7xl w-[95%] mx-auto my-16">
            <nav className="flex gap-4 mb-8">
              <router.Link
                to="/"
                activeProps={{
                  className: "text-violet-700 font-bold",
                }}
                inactiveProps={{
                  className: "text-slate-700",
                }}>
                Home
              </router.Link>
              <router.Link
                to="/posts"
                activeProps={{
                  className: "text-violet-700 font-bold",
                }}
                inactiveProps={{
                  className: "text-slate-700",
                }}>
                Posts
              </router.Link>
            </nav>
            <Outlet />
          </div>
        </RouterProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const AppEntry = () => {
  const { data } = trpc.hello.useQuery();

  if (!data) return <div>waiting...</div>;

  return (
    <h1 className="text-4xl font-bold text-slate-700">Test trpc: {data}</h1>
  );
};

const Posts = () => {
  const { data: posts } = trpc.posts.useQuery();
  if (!posts) return <div>waiting...</div>;
  return (
    <div className="flex gap-16 flex-col lg:flex-row lg:items-center">
      <div className="flex-1 space-y-5">
        <h1 className="text-4xl font-bold text-slate-700">Posts</h1>
        <div className="flex flex-col gap-2">
          {posts?.map((post) => (
            <router.Link
              key={post.id}
              to="/posts/:id"
              activeProps={{
                className: "text-violet-700 font-bold",
              }}
              inactiveProps={{
                className: "text-slate-700",
              }}
              params={{
                id: String(post.id),
              }}>
              {post.title}
            </router.Link>
          ))}
        </div>
      </div>
      <div className="flex-[2]">
        <Outlet />
      </div>
    </div>
  );
};

const Post = () => {
  const { params } = router.useMatch("/posts/:id");
  const { data: post } = trpc.post.useQuery({
    id: params.id,
  });
  if (!post) return <div>waiting...</div>;
  return (
    <div>
      <h2 className="text-3xl mb-8 text-slate-700 font-bold">{post.title}</h2>
      <p className="text-slate-700">{post.body}</p>
    </div>
  );
};

const routeConfig = createRouteConfig().createChildren((createRoute) => [
  createRoute({
    path: "/",
    element: <AppEntry />,
  }),
  createRoute({
    path: "posts",
    element: <Posts />,
    loader: async () => {
      if (!queryClient.getQueryData(["posts"])) {
        await queryClient.prefetchQuery(["posts"], () => client.posts.query());
      }
      return {};
    },
  }).createChildren((createRoute) => [
    createRoute({
      path: ":id",
      element: <Post />,
      loader: async ({ params: { id } }) => {
        if (!queryClient.getQueryData([["post"], { id }])) {
          await queryClient.prefetchQuery([["post"], { id }], () =>
            client.post.query({ id })
          );
        }
        return {};
      },
    }),
  ]),
]);

const router = createReactRouter({ routeConfig });
export default App;
