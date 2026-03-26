import { useCallback, useState } from 'react'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'

export type GeocodingResult = {
  address: string
  latitude: number
  longitude: number
  accuracy: number // meters — lower is better
}

// useGeolocation gets browser GPS position and reverse geocodes via the backend.
export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeocodingResult | null>(null)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Get GPS coordinates from browser
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, (err) => {
          const messages: Record<number, string> = {
            1: 'Location blocked. Click the lock icon in your address bar → Site settings → Location → Allow, then try again.',
            2: 'Location unavailable. Please check your device GPS settings.',
            3: 'Location request timed out. Please try again.',
          }
          reject(new Error(messages[err.code] || `Geolocation error (code ${err.code}): ${err.message}`))
        }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 })
      })

      const { latitude, longitude, accuracy } = position.coords

      // Step 2: Reverse geocode via backend
      const geocoded = await customFetchStandard<Omit<GeocodingResult, 'accuracy'>>('common/geocode/reverse', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude }),
      })

      const fullResult: GeocodingResult = { ...geocoded, accuracy }
      setResult(fullResult)
      return fullResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { getLocation, isLoading, error, result }
}

// Format accuracy into a human-readable string.
export function formatAccuracy(meters: number): { label: string; level: 'good' | 'ok' | 'poor' } {
  if (meters <= 20) return { label: `±${Math.round(meters)}m (precise)`, level: 'good' }
  if (meters <= 100) return { label: `±${Math.round(meters)}m`, level: 'ok' }
  if (meters <= 1000) return { label: `±${(meters / 1000).toFixed(1)}km (approximate)`, level: 'poor' }
  return { label: `±${Math.round(meters / 1000)}km (very approximate — please verify address)`, level: 'poor' }
}
