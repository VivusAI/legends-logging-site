import { Field, QueryLogResponse } from "@/typings/logs";
import { ListLogsSchema } from "@/typings/logs";
import { QueryKeys } from "@/typings/query";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useListFields(
  organizationId: string | undefined,
  datasetId: string | undefined,
) {
  return useQuery({
    queryKey: [QueryKeys.DatasetFields],
    queryFn: async ({ signal }) => {
      try {
        return await fetchApi<Field[]>(
          `/api/dash/${organizationId}/dataset/${datasetId}/fields`,
          {
            signal,
          },
        );
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });
}

export function useQueryLogs(
  organizationId: string | undefined,
  datasetId: string | undefined,
) {
  return useMutation({
    mutationKey: [QueryKeys.Logs, organizationId, datasetId],
    mutationFn: async (params: ListLogsSchema) => {
      try {
        return await fetchApi<QueryLogResponse>(
          `/api/dash/${organizationId}/dataset/${datasetId}/logs`,
          {
            method: "POST",
            body: JSON.stringify(params),
          },
        );
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });
}
