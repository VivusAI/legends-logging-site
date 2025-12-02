import { AssetResponse } from "@/typings/asset";
import { AssetParams } from "@/typings/assets";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useStorageFiles(params: AssetParams) {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ["storage", params.organizationId],
    queryFn: async () => {
      try {
        return await fetchApi<AssetResponse>(
          `/api/dash/storage/${params.organizationId}`,
        );
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
      }
    },
  });

  return {
    data,
    isLoading,
  };
}
