"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-green-500/50 group-[.toaster]:text-green-600",
          error: "group-[.toaster]:border-destructive/50 group-[.toaster]:text-destructive",
          warning: "group-[.toaster]:border-amber-500/50 group-[.toaster]:text-amber-600",
          info: "group-[.toaster]:border-blue-500/50 group-[.toaster]:text-blue-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
