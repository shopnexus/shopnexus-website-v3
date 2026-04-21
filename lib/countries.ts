import { useMemo } from "react"

// Starter list of supported countries (ISO 3166-1 alpha-2).
// Keep it compact; expand later as the marketplace grows.
export const SUPPORTED_COUNTRIES = [
  "VN", "US", "GB", "DE", "FR", "JP", "KR", "TH", "SG", "MY",
  "ID", "PH", "AU", "CA", "IN", "CN", "TW", "HK", "IT", "ES",
  "NL", "BR", "MX", "AE",
] as const

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number]

export type CountryOption = {
  code: string
  label: string
}

export function useCountryOptions(): CountryOption[] {
  return useMemo(() => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
    return SUPPORTED_COUNTRIES.map((code) => ({
      code,
      label: regionNames.of(code) ?? code,
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [])
}

/** Returns the localized country label for a code, falling back to the code itself. */
export function countryLabel(code: string | null | undefined): string {
  if (!code) return ""
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}
