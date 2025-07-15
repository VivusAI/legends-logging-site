import { LoginSchema } from "@/typings/auth";
import { ApiError, fetchApi } from "@/utils/http-util";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      try {
        return await fetchApi("/api/dash/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      navigate("/app");
    },
  });
}
