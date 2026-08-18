import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "./index.css";
import App from "./App";
import { PERSISTED_CACHE_MAX_AGE, queryClient } from "./app/queryClient";
import { queryKeys } from "./app/queryKeys";
import { queryPersister } from "./app/queryPersister";
import { AuthProvider } from "./features/auth/context/AuthProvider";
import { ThemeProvider } from "./features/theme/context/ThemeProvider";
import { SidebarProvider } from "./features/sidebar/context/SidebarProvider";

const persistedQueryKeys = new Set<string>([
  queryKeys.reasons.all[0],
  queryKeys.publicSummaries.all[0],
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: PERSISTED_CACHE_MAX_AGE,
        buster: "fines-public-cache-v2",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            persistedQueryKeys.has(String(query.queryKey[0])),
          shouldDehydrateMutation: () => false,
        },
      }}
    >
      <ThemeProvider>
        <SidebarProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SidebarProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
