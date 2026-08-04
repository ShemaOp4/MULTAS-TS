import { useQuery } from "@tanstack/react-query";
import { getMotivos } from "../api/motivos";
import type { Motivo } from "../types";

export const motivosKey = ["motivos"] as const;

export function useMotivos() {
  return useQuery<Motivo[]>({
    queryKey: motivosKey,
    queryFn: getMotivos,
  });
}
