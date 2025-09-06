"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TokenDataApiResponse {
  holders?: number
  error?: string
  source: 'web-scraper' | 'fallback'
  lastUpdated: string
}

interface HolderCountContextType {
  holderCount: number
  formattedHolderCount: string
  isLoading: boolean
  source: 'web-scraper' | 'fallback'
}

const HolderCountContext = createContext<HolderCountContextType | undefined>(undefined)

export function HolderCountProvider({ children }: { children: ReactNode }) {
  const [holderCount, setHolderCount] = useState<number>(1410) // Default fallback
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState<'web-scraper' | 'fallback'>('fallback')

  const fetchHolderCount = async (): Promise<number | undefined> => {
    try {
      console.log('🔍 [CONTEXT] Fetching holder count from server-side API...')
      
      // Use our server-side API route to avoid CORS issues
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now()
      const response = await fetch(`/api/token-data?t=${cacheBuster}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.error(`❌ [CONTEXT] Token data API HTTP error: ${response.status}`)
        return 1410 // Updated fallback
      }
      
      const data = await response.json()
      console.log('📊 [CONTEXT] Token data API response:', data)
      
      if (data.holders && typeof data.holders === 'number') {
        console.log(`✅ [CONTEXT] Fetched ${data.holders} holders from ${data.source} (updated: ${data.lastUpdated})`)
        setSource(data.source)
        return data.holders
      } else {
        console.error('❌ [CONTEXT] Token data API returned invalid data:', data)
        return 1410 // Updated fallback
      }
      
    } catch (error) {
      console.error('❌ [CONTEXT] Error fetching holder count from API:', error)
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
          console.log('📊 [CONTEXT] Updating shared holder count:', count)
          setHolderCount(count)
        }
      } catch (error) {
        console.error('❌ [CONTEXT] Holder count fetch error:', error)
        // Keep the fallback value (1410) that was set initially
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    console.log('🚀 [CONTEXT] Starting holder count context...')
    fetchData()
    
    // Refresh data every 5 minutes
    console.log('⏰ [CONTEXT] Setting up 5-minute refresh interval for shared holder count')
    const interval = setInterval(() => {
      console.log('🔄 [CONTEXT] Interval triggered - fetching fresh holder count...')
      fetchData()
    }, 300000)
    
    return () => {
      console.log('🛑 [CONTEXT] Cleaning up shared holder count refresh interval')
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

  const value: HolderCountContextType = {
    holderCount,
    formattedHolderCount: formatHolderCount(holderCount),
    isLoading,
    source
  }

  return (
    <HolderCountContext.Provider value={value}>
      {children}
    </HolderCountContext.Provider>
  )
}

export function useHolderCount(): HolderCountContextType {
  const context = useContext(HolderCountContext)
  if (context === undefined) {
    throw new Error('useHolderCount must be used within a HolderCountProvider')
  }
  return context
}
