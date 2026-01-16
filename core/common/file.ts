import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUploadFile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append("file", file)
      return customFetchStandard<{ id: string; url: string }>("common/files", {
        method: "POST",
        body: form,
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["common", "files"] })
    },
  })
}
