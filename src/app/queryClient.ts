import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

export const PERSISTED_CACHE_MAX_AGE = 1000 * 60 * 60 * 12;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: PERSISTED_CACHE_MAX_AGE,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function clearPrivateQueries() {
  queryClient.removeQueries({
    queryKey: queryKeys.finedPeople.all,
  });

  queryClient.removeQueries({
    queryKey: queryKeys.fines.root,
  });

  queryClient.removeQueries({
    queryKey: queryKeys.complaints.all,
  });
}
