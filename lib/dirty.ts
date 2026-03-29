"use client"

import { useCallback, useRef, useState } from "react"

/**
 * Hook that manages form state and tracks dirty (changed) fields for PATCH requests.
 *
 * @param initialData - Initial form values (from server or defaults)
 *
 * @example
 * const form = useDirty(product ? {
 *   name: product.name,
 *   description: product.description,
 * } : { name: "", description: "" })
 *
 * // In onChange handlers — updates form state AND marks field as dirty:
 * form.set("name", newName)
 *
 * // Read current values:
 * form.data.name
 *
 * // On submit — only send changed fields:
 * await update.mutateAsync({ id, ...form.dirty })
 *
 * // Check if anything changed:
 * if (!form.isDirty) toast.info("No changes")
 *
 * // Reset after data reload:
 * form.reset({ name: product.name, ... })
 */
export function useDirty<T extends Record<string, any>>(initialData: T) {
  const [data, setData] = useState<T>(initialData)
  const [dirty, setDirty] = useState<Partial<T>>({})
  const initialRef = useRef(initialData)

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    // Only mark dirty if value differs from initial
    const initial = initialRef.current[key]
    const same = typeof value === "object" || typeof initial === "object"
      ? JSON.stringify(value) === JSON.stringify(initial)
      : value === initial
    setDirty((prev) => {
      if (same) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }, [])

  const remove = useCallback(<K extends keyof T>(key: K) => {
    setData((prev) => ({ ...prev, [key]: initialRef.current[key] }))
    setDirty((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const reset = useCallback((newData?: T) => {
    const d = newData ?? initialRef.current
    initialRef.current = d
    setData(d)
    setDirty({})
  }, [])

  const isDirty = Object.keys(dirty).length > 0

  return { data, dirty, set, remove, reset, isDirty }
}
