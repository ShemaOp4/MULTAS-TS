import { useQuery } from "@tanstack/react-query";
import { getPublicSummaries } from "../api/publicSummaries";
import type { PublicSummary } from "../api/publicSummaries";
import { queryKeys } from "../../../app/queryKeys";

export function usePublicSummaries() {
  return useQuery<PublicSummary[]>({
    queryKey: queryKeys.publicSummaries.all,
    queryFn: getPublicSummaries,
  });
}
