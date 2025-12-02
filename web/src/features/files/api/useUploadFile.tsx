import { Params } from "@/typings/router";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";

export function useUploadFile() {
  const params = useParams<Params>();

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/dash/storage/${params.organizationId}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error("File upload failed");
      }
      return response.json();
    },
  });

  return { mutate, isPending };
}
