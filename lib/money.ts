// Smallest-unit-aware money utilities. Zero external deps — uses Intl APIs.
// All amounts are integers in the smallest unit of their currency
// (e.g. 299000 = ₫299,000; 1250 = $12.50).

const DECIMALS: Record<string, number> = {
  VND: 0, USD: 2, JPY: 0, KRW: 0, EUR: 2,
  GBP: 2, CNY: 2, SGD: 2, THB: 2, AUD: 2,
}

const getDecimals = (currency: string): number =>
  DECIMALS[currency] ?? 2

/**
 * Format a smallest-unit integer as a localized currency string.
 * `locale` defaults to the runtime's locale.
 */
export function formatMoney(
  amount: number,
  currency: string,
  locale?: string,
): string {
  const decimals = getDecimals(currency)
  const major = amount / Math.pow(10, decimals)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(major)
}

/**
 * Convert an amount between currencies using USD-based rates. Returns
 * integer smallest-unit in the target currency. Returns original unchanged
 * if either rate is missing (fail-open: display native rather than lying).
 */
export function convertMoney(
  amount: number,
  from: string,
  to: string,
  ratesFromUSD: Record<string, number>,
): number {
  if (from === to) return amount

  const rateFrom = from === "USD" ? 1 : ratesFromUSD[from]
  const rateTo = to === "USD" ? 1 : ratesFromUSD[to]
  if (!rateFrom || !rateTo) return amount

  const decFrom = getDecimals(from)
  const decTo = getDecimals(to)

  const majorFrom = amount / Math.pow(10, decFrom)
  const majorUSD = majorFrom / rateFrom
  const majorTo = majorUSD * rateTo
  return Math.round(majorTo * Math.pow(10, decTo))
}

/**
 * Localized currency display name, e.g. "US Dollar" / "Đô la Mỹ".
 */
export function getCurrencyName(currency: string, locale?: string): string {
  try {
    return (
      new Intl.DisplayNames([locale ?? "en"], { type: "currency" }).of(currency) ??
      currency
    )
  } catch {
    return currency
  }
}

/**
 * Inline string formatter for non-JSX contexts (toasts, button labels,
 * cart rows). Emits "PRIMARY (SECONDARY)" where primary depends on emphasis:
 *   - "preferred" (default — browse/cart/product): converted first, native in parens
 *   - "native" (checkout / Pay buttons): native first, converted in parens
 * When rates are unavailable or currency already matches preferred, returns
 * the native string only.
 */
export function formatPriceInline(
  amount: number,
  currency: string,
  preferred: string,
  rates: Record<string, number> | undefined,
  emphasis: "preferred" | "native" = "preferred",
): string {
  const native = formatMoney(amount, currency)
  if (!rates || currency === preferred) return native
  const converted = formatMoney(
    convertMoney(amount, currency, preferred, rates),
    preferred,
  )
  return emphasis === "preferred"
    ? `${converted} (${native})`
    : `${native} (${converted})`
}
