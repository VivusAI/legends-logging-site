import { ApiError, fetchApi } from "@/utils/http-util";
import { useMutation } from "@tanstack/react-query";

export function useDeleteToken() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (tokenId: number) => {
      try {
        return await fetchApi(`/api/dash/token/${tokenId}`, {
          method: "DELETE",
        });
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
      }
    },
  });

  return { mutateAsync, isPending };
}
