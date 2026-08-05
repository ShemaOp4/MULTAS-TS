import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../app/queryKeys";
import {
  createFine, getAllFines, getFinesByPerson, getPublicDashboardFines,
  payFine, subscribePublicDashboardFines,
} from "../api/fines";

export function useAllFines(enabled = true) {
  return useQuery({ queryKey: queryKeys.fines.all, queryFn: getAllFines, enabled });
}

export function usePublicDashboardFines() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: queryKeys.publicFines.all,
    queryFn: getPublicDashboardFines,
  });

  useEffect(() => subscribePublicDashboardFines(
    (fines) => queryClient.setQueryData(queryKeys.publicFines.all, fines),
    (error) => console.error("No se pudo actualizar el dashboard:", error),
  ), [queryClient]);

  return dashboardQuery;
}

export function useFinesByPerson(personId: string) {
  return useQuery({
    queryKey: queryKeys.fines.byPerson(personId),
    queryFn: () => getFinesByPerson(personId),
    enabled: Boolean(personId),
  });
}

export function usePayFine(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payFine,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fines.byPerson(personId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSummaries.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicFines.all });
    },
  });
}

export function useCreateFine() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { personId: string; reasonId: string; quantity: string }>({
    mutationFn: createFine,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fines.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSummaries.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicFines.all });
    },
  });
}
