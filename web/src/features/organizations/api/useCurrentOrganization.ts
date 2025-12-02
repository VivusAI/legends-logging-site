import { Organization } from "@/typings/organizations";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useQuery } from "@tanstack/react-query";

export function useCurrentOrganization(organizationId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: [organizationId],
    queryFn: async () => {
      try {
        return fetchApi<Organization>(
          `/api/dash/organization/${organizationId}`,
        );
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });

  console.log("useCurrentOrganization", data, isLoading);

  return { data, isLoading };
}
