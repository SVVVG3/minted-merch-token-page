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
    console.log(`🔍 [${timestamp}] Simple holder count fetch...`)
    
    // First, get cached value
    let cachedData: CachedHolderData | null = null
    try {
      cachedData = await get<CachedHolderData>(cacheKey)
      if (cachedData) {
        console.log(`💾 Found cached: ${cachedData.count} from ${cachedData.timestamp}`)
      }
    } catch (error) {
      console.log('⚠️ Cache read failed:', error)
    }
    
    // Try simple direct fetch
    let holderCount: number | null = null
    try {
      console.log('🔄 Direct fetch attempt...')
      
      const response = await fetch(`https://basescan.org/token/${contractAddress}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Referer': 'https://www.google.com/'
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })
      
      console.log(`📊 Response: ${response.status}`)
      
      if (response.ok) {
        const html = await response.text()
        console.log(`📄 HTML length: ${html.length}`)
        
        // Simple extraction
        const patterns = [
          /Holders?:\s*([0-9,]+)/i,
          /([0-9,]+)\s*Holders?/i
        ]
        
        for (const pattern of patterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            const numberStr = match[1].replace(/,/g, '')
            const parsedNumber = parseInt(numberStr, 10)
            
            if (!isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 1000000) {
              holderCount = parsedNumber
              console.log(`✅ Extracted: ${holderCount}`)
              break
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Direct fetch failed:', error)
    }
    
    // Determine final result
    let finalCount: number
    let source: 'web-scraper' | 'cached' | 'fallback'
    
    if (holderCount && holderCount > 0) {
      finalCount = holderCount
      source = 'web-scraper'
      console.log(`✅ Using live data: ${finalCount}`)
    } else if (cachedData && cachedData.count > 0) {
      finalCount = cachedData.count
      source = 'cached'
      console.log(`💾 Using cached data: ${finalCount}`)
    } else {
      finalCount = 1410
      source = 'fallback'
      console.log(`📊 Using fallback: ${finalCount}`)
    }
    
    const response = NextResponse.json({
      holders: finalCount,
      source: source,
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json({
      holders: 1410,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
  }
}
