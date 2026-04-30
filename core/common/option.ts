import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { getQueryClient } from "@/lib/queryclient/query-client"
import { useMutation, useQuery } from "@tanstack/react-query"
import qs from "qs"

// ===== Types =====

// Mirrors backend sharedmodel.Option. uuid.NullUUID JSON-serializes as either
// the UUID string (when Valid) or null, so owner_id / logo_rs_id are
// `string | null` on the wire — not the {UUID, Valid} envelope.
export type Option = {
  id: string
  owner_id: string | null
  type: OptionType
  provider: string
  is_enabled: boolean
  name: string
  description: string
  priority: number
  logo_rs_id: string | null
  data: Record<string, unknown>
}

export type OptionType = "payment" | "transport" | "object_store"

// ===== Hooks =====

export const useListOption = (params: { category: string }) =>
  useQuery({
    queryKey: ["common", "option", "list", params],
    queryFn: () =>
      customFetchStandard<Option[]>(`common/option?${qs.stringify(params)}`),
  })

export const useUpsertOptions = () =>
  useMutation({
    mutationFn: async (params: { category: string; configs: Option[] }) =>
      customFetchStandard<{ message: string }>("common/option", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ["common", "option"] })
    },
  })

export const useDeleteOptions = () =>
  useMutation({
    mutationFn: async (params: { ids: string[] }) =>
      customFetchStandard<{ message: string }>("common/option", {
        method: "DELETE",
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ["common", "option"] })
    },
  })

// Legacy alias kept so older imports keep compiling. Prefer `Option`.
export type ServiceOption = Option

// Legacy hook alias matching the old signature. Prefer `useListOption`.
export const useListServiceOption = useListOption
