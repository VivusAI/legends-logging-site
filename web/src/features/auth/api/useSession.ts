import { QueryKeys } from "@/typings/query";
import { Session } from "@/typings/user";
import { fetchApi } from "@/utils/http-util";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useSession() {
  const { data, isPending, error } = useQuery({
    queryKey: [QueryKeys.Session],
    queryFn: () => fetchApi<Session>("/api/dash/auth/session"),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, isPending, error, isAuthenticated: !!data };
}

export function useLogout() {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await fetchApi("/api/dash/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      queryClient.clear();
      window.location.href = "/auth";
    }
  };

  return { logout };
}
