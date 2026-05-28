import { NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'web-scraper' | 'cached' | 'fallback'
  lastUpdated: string
}

interface CachedHolderData {
  count: number
  timestamp: string
  source: 'web-scraper'
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  const cacheKey = `holder-count-${contractAddress}`
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Getting holder count via multiple methods...`)
    
    // First, get the cached value to use as smart fallback
    let cachedData: CachedHolderData | null = null
    try {
      cachedData = await get<CachedHolderData>(cacheKey)
      if (cachedData) {
        console.log(`💾 Found cached holder count: ${cachedData.count} from ${cachedData.timestamp}`)
      } else {
        console.log('💾 No cached holder count found in Edge Config')
      }
    } catch (error) {
      console.log('⚠️ Failed to read from Edge Config cache:', error)
    }
    
    let holderCount: number | null = null
    
    // Method 1: Use official Basescan API (Base chain)
    const apiKey = process.env.BASESCAN_API_KEY
    if (apiKey) {
      try {
        console.log('🔑 Method 1: Using Basescan API with key...')
        
        // Base chain uses api.basescan.org
        const apiUrl = `https://api.basescan.org/api?module=stats&action=tokenholdercount&contractaddress=${contractAddress}&apikey=${apiKey}`
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          signal: AbortSignal.timeout(10000)
        })
        
        console.log(`📊 Basescan API response: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`📄 Basescan API data:`, data)
          
          if (data.status === '1' && data.result) {
            const count = parseInt(data.result, 10)
            if (!isNaN(count) && count > 0) {
              holderCount = count
              console.log(`✅ Method 1 success: ${holderCount} holders via Basescan API`)
            }
          } else {
            console.log(`⚠️ Basescan API returned error: ${data.message || 'Unknown error'}`)
          }
        }
      } catch (error) {
        console.log('⚠️ Method 1 (Basescan API) failed:', error)
      }
    } else {
      console.log('⚠️ BASESCAN_API_KEY not configured, skipping API method')
    }
    
    // Method 2: Fallback to web scraping if API fails
    if (!holderCount) {
      try {
        console.log('🌐 Method 2: Fallback web scraping...')
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://basescan.org/token/${contractAddress}`)}`
        
        const proxyResponse = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000)
        })
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json()
          if (proxyData.contents) {
            holderCount = extractHolderCount(proxyData.contents)
            if (holderCount) {
              console.log(`✅ Method 2 success: ${holderCount} holders via web scraping`)
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Method 2 (web scraping) failed:', error)
      }
    }
    
    // Helper function to extract holder count from HTML
    function extractHolderCount(html: string): number | null {
      console.log('🔍 Attempting to extract holder count from HTML (length:', html.length, 'chars)')
      
      const patterns = [
        // Pattern for "Holders: 1,416" format (most common)
        /Holders?:\s*([0-9,]+)/i,
        // Pattern for "1,416 Holders" format  
        /([0-9,]+)\s*Holders?/i,
        // Pattern for JSON-like "holders": "1,416"
        /"holders?"[:\s]*"?([0-9,]+)"?/i,
        // Pattern for "holder" followed by number
        /holder[s]?[^0-9]*([0-9,]+)/i,
        // Pattern for various separators
        /holders?['":\s]*([0-9,]+)/i,
        // Pattern specifically for the format we saw: "Holders: 1,416"
        /Holders:\s*([0-9,]+)/i,
        // More flexible pattern for any "holders" text followed by number
        /holders?[^\d]*([0-9,]+)/i
      ]
      
      // Log a sample of the HTML to see what we're working with
      const htmlSample = html.substring(0, 500)
      console.log('📄 HTML sample:', htmlSample)
      
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]
        const match = html.match(pattern)
        console.log(`🔍 Pattern ${i + 1} (${pattern}):`, match ? `Found "${match[1]}"` : 'No match')
        
        if (match && match[1]) {
          const numberStr = match[1].replace(/,/g, '') // Remove commas
          const parsedNumber = parseInt(numberStr, 10)
          
          console.log(`🔢 Parsed number: ${parsedNumber} (valid: ${!isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 1000000})`)
          
          if (!isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 1000000) {
            console.log(`✅ Successfully extracted holder count: ${parsedNumber}`)
            return parsedNumber
          }
        }
      }
      
      console.log('❌ No valid holder count found in HTML')
      return null
    }
    
    // Determine source and final holder count
    let finalHolderCount: number
    let source: 'web-scraper' | 'cached' | 'fallback'
    
    if (holderCount && holderCount > 0) {
      console.log(`✅ Successfully scraped ${holderCount} holders`)
      finalHolderCount = holderCount
      source = 'web-scraper'
      
      // Note: Edge Config is read-only from API routes
      // We'll update it manually when needed or create a separate update mechanism
      console.log(`💾 Successfully scraped ${holderCount} holders (Edge Config update needed manually)`)
      
      // TODO: Consider implementing a webhook or manual update process for Edge Config
      // Edge Config is designed for configuration data that changes infrequently
    } else if (cachedData && cachedData.count > 0) {
      console.log(`📊 Scraping failed, using cached count: ${cachedData.count} from ${cachedData.timestamp}`)
      finalHolderCount = cachedData.count
      source = 'cached'
    } else {
      console.log('📊 No scraping or cached data available, using hardcoded fallback')
      finalHolderCount = 29449 // Final fallback (Basescan data as of 2026-05-28)
      source = 'fallback'
    }
      
    const apiResponse = NextResponse.json({
      holders: finalHolderCount,
      source: source,
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers to prevent caching
    apiResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    apiResponse.headers.set('Pragma', 'no-cache')
    apiResponse.headers.set('Expires', '0')
    
    return apiResponse
    
  } catch (error) {
    console.error('❌ Error scraping holder count from Basescan:', error)
    
    // Fallback to known accurate count
    console.log('📊 Using fallback holder count')
    let holderCount = 29449 // Updated fallback count (Basescan data as of 2026-05-28)
    
    const fallbackResponse = NextResponse.json({
      holders: holderCount,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers to prevent caching
    fallbackResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    fallbackResponse.headers.set('Pragma', 'no-cache')
    fallbackResponse.headers.set('Expires', '0')
    
    return fallbackResponse
  }
}
