import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const TestTRPC = () => {
  const { data } = trpc.hello.useQuery();

  if (!data) return <div>waiting...</div>;

  return <p>Test trpc: {data}</p>;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
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
        <TestTRPC />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default App;
