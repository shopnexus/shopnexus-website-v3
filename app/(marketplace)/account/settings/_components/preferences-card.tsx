"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Globe, Moon } from "lucide-react"
import { CurrencyPicker } from "@/components/ui/currency-picker"
import {
  useExchangeRates,
  usePreferredCurrency,
  useUpdatePreferredCurrency,
} from "@/core/common/currency"
import { toast } from "sonner"

export function PreferencesCard() {
  const preferred = usePreferredCurrency()
  const { data: rates } = useExchangeRates()
  const updatePreferred = useUpdatePreferredCurrency()

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
            <p className="font-medium">Currency</p>
            <p className="text-sm text-muted-foreground">
              Used to display prices across the site
            </p>
          </div>
          <div className="w-64">
            {rates && (
              <CurrencyPicker
                value={preferred}
                supported={rates.supported}
                onChange={(c) =>
                  updatePreferred.mutate(c, {
                    onSuccess: () => toast.success(`Now showing prices in ${c}`),
                    onError: () => toast.error("Failed to update currency"),
                  })
                }
                disabled={updatePreferred.isPending}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
