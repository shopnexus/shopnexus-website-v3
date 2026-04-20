// Smallest-unit-aware money utilities. Zero external deps — uses Intl APIs.
// All amounts are integers in the smallest unit of their currency
// (e.g. 299000 = ₫299,000; 1250 = $12.50).

// Cache Intl.NumberFormat instances per currency. Constructing an NF is ~0.1ms
// but adds up when formatting price lists; cached instances reuse the
// runtime's internal pattern parsing.
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string, locale?: string): Intl.NumberFormat {
  const key = `${locale ?? ""}::${currency}`
  let fmt = formatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { style: "currency", currency })
    formatterCache.set(key, fmt)
  }
  return fmt
}

// getDecimals returns the ISO 4217 minor-unit exponent via CLDR data
// (e.g. VND=0, USD=2, JPY=0, BHD=3, CLF=4). Falls back to 2 for unknown codes.
function getDecimals(currency: string): number {
  try {
    return (
      getFormatter(currency).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

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
  return getFormatter(currency, locale).format(major)
}

/**
 * Convert an amount between currencies using USD-based rates. Returns
 * integer smallest-unit in the target currency, or `null` if either rate
 * is missing. Callers must handle null by showing the native currency
 * only — returning the original amount would silently mis-scale it
 * through the target's decimals (e.g. ₫694 → "MX$6.94").
 */
export function convertMoney(
  amount: number,
  from: string,
  to: string,
  ratesFromUSD: Record<string, number>,
): number | null {
  if (from === to) return amount

  const rateFrom = from === "USD" ? 1 : ratesFromUSD[from]
  const rateTo = to === "USD" ? 1 : ratesFromUSD[to]
  if (!rateFrom || !rateTo) return null

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
  const conv = convertMoney(amount, currency, preferred, rates)
  if (conv === null) return native
  const converted = formatMoney(conv, preferred)
  return emphasis === "preferred"
    ? `${converted} (${native})`
    : `${native} (${converted})`
}
