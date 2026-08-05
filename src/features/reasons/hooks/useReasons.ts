import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../app/queryKeys";
import { getReasons } from "../api/reasons";
import type { Reason } from "../types";

export function useReasons() {
  return useQuery<Reason[]>({
    queryKey: queryKeys.reasons.all,
    queryFn: getReasons,
  });
}
