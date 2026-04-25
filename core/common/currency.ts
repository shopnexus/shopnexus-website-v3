import { useQuery } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useGetMe } from "@/core/account/account"

export type ExchangeRateSnapshot = {
  base: string
  rates: Record<string, number>
  fetched_at: string | null
  supported: string[]
}

const RATES_QUERY_KEY = ["common", "exchange-rates"] as const
const DEFAULT_CURRENCY = "VND"

export const useExchangeRates = () =>
  useQuery({
    queryKey: RATES_QUERY_KEY,
    queryFn: () =>
      customFetchStandard<ExchangeRateSnapshot>("common/currencies/rates"),
    staleTime: 60 * 60 * 1000,           // 1h — rate updates BE-side every 6h
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

/**
 * Returns the active currency for the signed-in user, derived server-side
 * from `profile.country`. Falls back to VND for guests or before /me loads.
 */
export function useCurrency(): string {
  const { data: me } = useGetMe()
  return me?.currency ?? DEFAULT_CURRENCY
}
