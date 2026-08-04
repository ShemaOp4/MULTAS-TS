import { useQuery } from "@tanstack/react-query";
import { getPublicSummaries } from "../api/publicSummaries";
import type { PublicSummary } from "../api/publicSummaries";

export const publicSummariesKey = ["public-summaries"] as const;

export function usePublicSummaries() {
  return useQuery<PublicSummary[]>({
    queryKey: publicSummariesKey,
    queryFn: getPublicSummaries,
  });
}
