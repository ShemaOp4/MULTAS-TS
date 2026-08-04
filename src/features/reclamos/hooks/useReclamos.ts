import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReclamo,
  getReclamos,
  setReclamoStatus,
} from "../api/reclamos";

export const reclamosKey = ["reclamos"] as const;

export function useCreateReclamo() {
  return useMutation({ mutationFn: createReclamo });
}

export function useReclamos() {
  return useQuery({ queryKey: reclamosKey, queryFn: getReclamos });
}

export function useSetReclamoStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setReclamoStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reclamosKey }),
  });
}
