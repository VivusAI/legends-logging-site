import { QueryKeys } from "@/typings/query";
import { Params } from "@/typings/router";
import { TokenParams, TokenPreview } from "@/typings/token";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";

export function useCreateToken() {
  const params = useParams<Params>();

  const { mutateAsync, data, isSuccess, reset } = useMutation({
    mutationKey: [QueryKeys.CreateToken],
    mutationFn: async (tokenParams: TokenParams) => {
      try {
        return await fetchApi<TokenPreview>(
          `/api/dash/${params.organizationId}/token`,
          {
            method: "POST",
            body: JSON.stringify(tokenParams),
          },
        );
      } catch (err) {
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
      }
    },
  });

  return { mutateAsync, data, isSuccess, reset };
}
