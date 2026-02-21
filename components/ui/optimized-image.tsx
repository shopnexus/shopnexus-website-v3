"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { ImageOff } from "lucide-react"

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallback?: React.ReactNode
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto"
  showPlaceholder?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback,
  aspectRatio = "auto",
  showPlaceholder = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  }[aspectRatio]

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          aspectRatioClass,
          className
        )}
      >
        {fallback || (
          <div className="flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Image not available</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
      {/* Shimmer placeholder */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        {...props}
      />
    </div>
  )
}

// Blur placeholder generator for static images
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="20%" />
          <stop stop-color="#edeef1" offset="50%" />
          <stop stop-color="#f6f7f8" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f6f7f8" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `

  const toBase64 = (str: string) =>
    typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str)

  return `data:image/svg+xml;base64,${toBase64(shimmer)}`
}
