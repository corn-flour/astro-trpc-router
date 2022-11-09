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
          <nav>
            <router.Link to="/">Home</router.Link>
            <router.Link to="/posts">Posts</router.Link>
          </nav>
          <Outlet />
        </RouterProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const AppEntry = () => {
  const { data } = trpc.hello.useQuery();

  if (!data) return <div>waiting...</div>;

  return <p>Test trpc: {data}</p>;
};

const Posts = () => {
  const { data: posts } = trpc.posts.useQuery();
  if (!posts) return <div>waiting...</div>;
  return (
    <>
      <div>
        <h1>Posts</h1>
        {posts?.map((post) => (
          <router.Link
            key={post.id}
            to="/posts/:id"
            params={{
              id: String(post.id),
            }}>
            {post.title}
          </router.Link>
        ))}
      </div>
      <div>
        <Outlet />
      </div>
    </>
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
      <h2>{post.title}</h2>
      <p>{post.body}</p>
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
