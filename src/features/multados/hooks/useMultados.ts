import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMultado, getMultados, setMultadoActive } from "../api/multados";
import type { Multado } from "../types";

export const multadosKey = ["multados"] as const;

export function useMultados() {
  return useQuery<Multado[]>({
    queryKey: multadosKey,
    queryFn: getMultados,
  });
}

export function useCreateMultado() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { firstName: string; lastName: string }>({
    mutationFn: createMultado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multadosKey });
    },
  });
}

export function useSetMultadoActive() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: setMultadoActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multadosKey });
    },
  });
}
