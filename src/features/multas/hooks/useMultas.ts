import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMulta,
  getAllMultas,
  getMultasByMultado,
  getPublicDashboardMultas,
  payMulta,
  subscribePublicDashboardMultas,
} from "../api/multas";

export const multasKey = ["multas"];

export function useAllMultas(enabled = true) {
  return useQuery({
    queryKey: [...multasKey, "all"],
    queryFn: getAllMultas,
    enabled,
  });
}

export function usePublicDashboardMultas() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["public-multas"],
    queryFn: getPublicDashboardMultas,
  });

  useEffect(
    () =>
      subscribePublicDashboardMultas(
        (multas) => queryClient.setQueryData(["public-multas"], multas),
        (error) => console.error("No se pudo actualizar el dashboard:", error),
      ),
    [queryClient],
  );

  return dashboardQuery;
}

export function useMultasByMultado(multadoId: string) {
  return useQuery({
    queryKey: [...multasKey, multadoId],
    queryFn: () => getMultasByMultado(multadoId),
    enabled: Boolean(multadoId),
  });
}

export function usePayMulta(multadoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payMulta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...multasKey, multadoId] });
      queryClient.invalidateQueries({ queryKey: ["public-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["public-multas"] });
    },
  });
}

export function useCreateMulta() {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    Error,
    { multadoId: string; motivoId: string; quantity: string }
  >({
    mutationFn: createMulta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multasKey });
      queryClient.invalidateQueries({ queryKey: ["public-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["public-multas"] });
    },
  });
}
