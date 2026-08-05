import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../app/queryKeys";
import {
  createComplaint,
  getComplaints,
  setComplaintStatus,
} from "../api/complaints";

export function useCreateComplaint() {
  return useMutation({ mutationFn: createComplaint });
}

export function useComplaints() {
  return useQuery({
    queryKey: queryKeys.complaints.all,
    queryFn: getComplaints,
  });
}

export function useSetComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setComplaintStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all }),
  });
}
