import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const currencyLocaleMap: Record<string, string> = {
	VND: "vi-VN",
	USD: "en-US",
	EUR: "de-DE",
	JPY: "ja-JP",
	KRW: "ko-KR",
}

export function formatPrice(price: number, currency: string = "VND"): string {
	const locale = currencyLocaleMap[currency] || "vi-VN"
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
	}).format(price)
}

export function formatDate(date: string | Date): string {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date))
}

// Format sold count (e.g., 1200 -> "1.2k")
export function formatSoldCount(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`
	}
	return count.toString()
}

export function formatTimeAgo(date: string): string {
	const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
	if (seconds < 60) return "just now"
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
	return new Date(date).toLocaleDateString()
}
