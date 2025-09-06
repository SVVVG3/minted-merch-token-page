"use client"

import { useState, useEffect } from 'react'

interface TokenDataApiResponse {
  holders?: number
  error?: string
  source: 'web-scraper' | 'fallback'
  lastUpdated: string
}

export function useHolderCount() {
  const [holderCount, setHolderCount] = useState<number>(1410) // Default fallback
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState<'web-scraper' | 'fallback'>('fallback')

  const fetchHolderCount = async (): Promise<number | undefined> => {
    try {
      console.log('🔍 Fetching holder count from server-side API...')
      
      // Use our server-side API route to avoid CORS issues
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now()
      const response = await fetch(`/api/token-data?t=${cacheBuster}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.error(`❌ Token data API HTTP error: ${response.status}`)
        return 1410 // Updated fallback
      }
      
      const data = await response.json()
      console.log('📊 Token data API response:', data)
      
      if (data.holders && typeof data.holders === 'number') {
        console.log(`✅ Fetched ${data.holders} holders from ${data.source} (updated: ${data.lastUpdated})`)
        setSource(data.source)
        return data.holders
      } else {
        console.error('❌ Token data API returned invalid data:', data)
        return 1410 // Updated fallback
      }
      
    } catch (error) {
      console.error('❌ Error fetching holder count from API:', error)
      return 1410 // Updated fallback
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create timeout wrapper for API calls
        const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
            )
          ])
        }

        // Fetch holder count with timeout
        const count = await withTimeout(fetchHolderCount(), 15000) // 15 second timeout
        
        if (count && typeof count === 'number' && count > 0) {
          console.log('📊 Updating shared holder count:', count)
          setHolderCount(count)
        }
      } catch (error) {
        console.error('❌ Holder count fetch error:', error)
        // Keep the fallback value (1410) that was set initially
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchData()
    
    // Refresh data every 5 minutes
    console.log('⏰ Setting up 5-minute refresh interval for shared holder count')
    const interval = setInterval(() => {
      console.log('🔄 Interval triggered - fetching fresh holder count...')
      fetchData()
    }, 300000)
    
    return () => {
      console.log('🛑 Cleaning up shared holder count refresh interval')
      clearInterval(interval)
    }
  }, [])

  // Format holder count for display (round to nearest hundred, show as K+)
  const formatHolderCount = (count: number): string => {
    if (count < 1000) {
      return `${count}`
    }
    
    // Round to nearest hundred
    const rounded = Math.round(count / 100) * 100
    const kValue = rounded / 1000
    
    // If it's a clean thousand (1.0, 2.0, etc), show as "1K+", "2K+"
    if (kValue === Math.floor(kValue)) {
      return `${Math.floor(kValue)}K+`
    }
    
    // Otherwise show as "1.4K+", "1.5K+", etc
    return `${kValue.toFixed(1)}K+`
  }

  return {
    holderCount,
    formattedHolderCount: formatHolderCount(holderCount),
    isLoading,
    source
  }
}
