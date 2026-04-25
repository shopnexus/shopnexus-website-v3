"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Globe, Moon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetMe, useUpdateCountry } from "@/core/account/account"
import { countryLabel, useCountryOptions } from "@/lib/countries"
import { isWalletNotEmpty } from "@/lib/queryclient/response.type"
import { toast } from "sonner"

export function PreferencesCard() {
  const { data: me } = useGetMe()
  const countryOptions = useCountryOptions()
  const updateCountry = useUpdateCountry()
  const currentCountry = me?.country ?? ""

  const handleCountryChange = (code: string) => {
    if (!code || code === currentCountry) return
    updateCountry.mutate(code, {
      onSuccess: (res) => {
        toast.success(
          `Country updated to ${countryLabel(res.country)} (${res.country})`,
          {
            description: `Prices will be shown in ${res.inferred_currency}.`,
          },
        )
      },
      onError: (err) => {
        if (isWalletNotEmpty(err)) {
          toast.error("Cannot change country", {
            description:
              "Your wallet has a non-zero balance. Please spend or withdraw your balance before changing your country.",
          })
          return
        }
        toast.error("Failed to update country")
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Preferences
        </CardTitle>
        <CardDescription>
          Customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark theme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Switch />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Language</p>
            <p className="text-sm text-muted-foreground">
              English (US)
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            Change
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Country</p>
            <p className="text-sm text-muted-foreground">
              {currentCountry
                ? `${currentCountry} — ${countryLabel(currentCountry)}`
                : "Not set"}
              {me?.currency && ` · Currency: ${me.currency}`}
            </p>
          </div>
          <div className="w-64">
            <Select
              value={currentCountry || undefined}
              onValueChange={handleCountryChange}
              disabled={!me || updateCountry.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
