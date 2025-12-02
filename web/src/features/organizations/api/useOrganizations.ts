import { Organization } from "@/typings/organizations";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useQuery } from "@tanstack/react-query";

export function useOrganizations() {
  const { data, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      try {
        return fetchApi<Organization[]>("/api/dash/organization");
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });

  return { data, isLoading };
}
