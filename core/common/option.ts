import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useQuery } from "@tanstack/react-query"
import qs from "qs"

// ===== Types =====

export type ServiceOption = {
  id: string
  provider: string
  method: string
  name: string
  description: string
}

// ===== Hooks =====

export const useListServiceOption = (params: {
  category: string
}) =>
  useQuery({
    queryKey: ['service-option', 'list', params],
    queryFn: () => customFetchStandard<ServiceOption[]>(`common/option?${qs.stringify(params)}`),
  })


