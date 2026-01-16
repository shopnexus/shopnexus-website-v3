"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { useUploadFile } from "@/core/common/file"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ImagePlus,
  X,
  Loader2,
  Upload,
  AlertCircle,
  GripVertical,
  ZoomIn,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export interface UploadedImage {
  id: string
  url: string
}

interface ImageUploadProps {
  value?: UploadedImage[]
  onChange?: (images: UploadedImage[]) => void
  maxFiles?: number
  maxSizeInMB?: number
  accept?: string
  className?: string
  disabled?: boolean
  aspectRatio?: "square" | "video" | "auto"
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizeInMB = 5,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  className,
  disabled = false,
  aspectRatio = "square",
}: ImageUploadProps) {
  const uploadFile = useUploadFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto min-h-[120px]",
  }[aspectRatio]

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newErrors: string[] = []

    // Validate file count
    if (value.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} images allowed`)
      setErrors(newErrors)
      return
    }

    const validFiles: File[] = []

    for (const file of fileArray) {
      // Validate file type
      if (!accept.split(",").some(type => file.type.match(type.trim()))) {
        newErrors.push(`${file.name}: Invalid file type`)
        continue
      }

      // Validate file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        newErrors.push(`${file.name}: File too large (max ${maxSizeInMB}MB)`)
        continue
      }

      validFiles.push(file)
    }

    setErrors(newErrors)

    // Upload valid files
    const uploadedImages: UploadedImage[] = []

    for (const file of validFiles) {
      const tempId = `temp-${Date.now()}-${Math.random()}`
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [tempId]: Math.min((prev[tempId] || 0) + 10, 90)
          }))
        }, 100)

        const result = await uploadFile.mutateAsync(file)

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [tempId]: 100 }))

        uploadedImages.push({
          id: result.id,
          url: result.url,
        })

        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[tempId]
            return newProgress
          })
        }, 500)
      } catch (error) {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[tempId]
          return newProgress
        })
        newErrors.push(`${file.name}: Upload failed`)
        setErrors(prev => [...prev, `${file.name}: Upload failed`])
      }
    }

    if (uploadedImages.length > 0) {
      onChange?.([...value, ...uploadedImages])
    }
  }, [value, maxFiles, maxSizeInMB, accept, onChange, uploadFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [disabled, handleFiles])

  const handleRemove = useCallback((id: string) => {
    onChange?.(value.filter(img => img.id !== id))
  }, [value, onChange])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...value]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange?.(newImages)
  }, [value, onChange])

  const isUploading = Object.keys(uploadProgress).length > 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all cursor-pointer",
          "flex flex-col items-center justify-center gap-3 p-6 sm:p-8",
          "hover:border-primary/50 hover:bg-muted/50",
          dragActive && "border-primary bg-primary/5 scale-[1.01]",
          disabled && "opacity-50 cursor-not-allowed",
          value.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled || value.length >= maxFiles}
          className="hidden"
        />

        <div className={cn(
          "h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors",
          dragActive ? "bg-primary/20" : "bg-muted"
        )}>
          {isUploading ? (
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin" />
          ) : (
            <Upload className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 transition-colors",
              dragActive ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag & drop images here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse • Max {maxSizeInMB}MB per file • {maxFiles - value.length} remaining
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full max-w-xs">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.max(...Object.values(uploadProgress))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                className="ml-auto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "group relative rounded-lg overflow-hidden bg-muted border",
                aspectRatioClass
              )}
            >
              <Image
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded">
                  Primary
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewImage(image.url)
                  }}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(image.id)
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Drag Handle */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-6 w-6 rounded bg-white/90 flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {value.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2",
                "hover:border-primary/50 hover:bg-muted/50 transition-colors",
                aspectRatioClass,
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {previewImage && (
            <div className="relative aspect-video bg-black">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
