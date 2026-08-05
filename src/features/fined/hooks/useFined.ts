import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../app/queryKeys";
import {
  createFinedPerson,
  getFinedPeople,
  setFinedPersonActive,
} from "../api/fined";
import type { FinedPerson } from "../types";

export function useFinedPeople() {
  return useQuery<FinedPerson[]>({
    queryKey: queryKeys.finedPeople.all,
    queryFn: getFinedPeople,
  });
}

export function useCreateFinedPerson() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { firstName: string; lastName: string }>({
    mutationFn: createFinedPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.finedPeople.all,
      });
    },
  });
}

export function useSetFinedPersonActive() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: setFinedPersonActive,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.finedPeople.all,
      });
    },
  });
}
