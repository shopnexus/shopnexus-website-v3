"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { getCurrencyName } from "@/lib/money"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Map ISO 4217 currency -> primary ISO 3166-1 alpha-2 country for flag.
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  VND: "VN", USD: "US", JPY: "JP", KRW: "KR", EUR: "EU",
  GBP: "GB", CNY: "CN", SGD: "SG", THB: "TH", AUD: "AU",
}
const POPULAR = ["VND", "USD", "JPY", "KRW", "EUR"]

function FlagEmoji({ country }: { country: string }) {
  // Emoji flag via regional indicators. EU has no emoji flag → use 🇪🇺.
  if (country === "EU") return <span aria-hidden="true">🇪🇺</span>
  if (country.length !== 2) return <span aria-hidden="true">💱</span>
  const base = 127397
  const chars = [...country.toUpperCase()].map(
    (c) => String.fromCodePoint(base + c.charCodeAt(0))
  )
  return <span aria-hidden="true">{chars.join("")}</span>
}

export type CurrencyPickerProps = {
  value: string
  supported: string[]
  onChange: (currency: string) => void
  disabled?: boolean
}

export function CurrencyPicker({
  value, supported, onChange, disabled,
}: CurrencyPickerProps) {
  const [open, setOpen] = useState(false)
  const popular = supported.filter((c) => POPULAR.includes(c))
  const rest = supported.filter((c) => !POPULAR.includes(c)).sort()

  const render = (c: string) => (
    <CommandItem
      key={c}
      value={c}
      onSelect={() => {
        onChange(c)
        setOpen(false)
      }}
    >
      <FlagEmoji country={CURRENCY_TO_COUNTRY[c] ?? "UN"} />
      <span className="ml-2 font-medium">{c}</span>
      <span className="ml-2 text-muted-foreground truncate">
        {getCurrencyName(c)}
      </span>
      {value === c && <Check className="ml-auto h-4 w-4" />}
    </CommandItem>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full justify-between")}
        >
          <span className="flex items-center gap-2">
            <FlagEmoji country={CURRENCY_TO_COUNTRY[value] ?? "UN"} />
            {value} — {getCurrencyName(value)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            {popular.length > 0 && (
              <CommandGroup heading="Popular">{popular.map(render)}</CommandGroup>
            )}
            {rest.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="All currencies">{rest.map(render)}</CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
