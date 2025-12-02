import { QueryKeys } from "@/typings/query";
import { Token } from "@/typings/token";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useTokens() {
  const result = useSuspenseQuery({
    queryKey: [QueryKeys.Tokens],
    queryFn: async () => {
      try {
        return fetchApi<Token[]>("/api/dash/token");
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });

  return result.data;
}
