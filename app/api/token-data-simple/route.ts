import { NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'
import fs from 'fs'
import path from 'path'

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

// Simple in-memory cache as fallback
let memoryCache: CachedHolderData | null = null

// Helper functions for file-based caching
function getCacheFilePath(): string {
  return path.join(process.cwd(), 'tmp', 'holder-cache.json')
}

async function readFileCache(): Promise<CachedHolderData | null> {
  try {
    const cacheFile = getCacheFilePath()
    if (fs.existsSync(cacheFile)) {
      const data = fs.readFileSync(cacheFile, 'utf8')
      const parsed = JSON.parse(data) as CachedHolderData
      console.log(`📁 File cache: ${parsed.count} from ${parsed.timestamp}`)
      return parsed
    }
  } catch (error) {
    console.log('⚠️ File cache read failed:', error)
  }
  return null
}

async function writeFileCache(data: CachedHolderData): Promise<void> {
  try {
    const cacheFile = getCacheFilePath()
    const dir = path.dirname(cacheFile)
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2))
    console.log(`💾 Cached to file: ${data.count}`)
  } catch (error) {
    console.log('⚠️ File cache write failed:', error)
  }
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  const cacheKey = `holder-count-${contractAddress}`
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Simple holder count fetch...`)
    
    // Get cached value from multiple sources
    let cachedData: CachedHolderData | null = null
    
    // Try Edge Config first
    try {
      cachedData = await get<CachedHolderData>(cacheKey)
      if (cachedData) {
        console.log(`💾 Edge Config cache: ${cachedData.count} from ${cachedData.timestamp}`)
      }
    } catch (error) {
      console.log('⚠️ Edge Config read failed:', error)
    }
    
    // Try file cache if Edge Config fails
    if (!cachedData) {
      cachedData = await readFileCache()
    }
    
    // Try memory cache as last resort
    if (!cachedData && memoryCache) {
      cachedData = memoryCache
      console.log(`🧠 Memory cache: ${cachedData.count} from ${cachedData.timestamp}`)
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
    
    // Determine final result and cache successful scrapes
    let finalCount: number
    let source: 'web-scraper' | 'cached' | 'fallback'
    
    if (holderCount && holderCount > 0) {
      finalCount = holderCount
      source = 'web-scraper'
      console.log(`✅ Using live data: ${finalCount}`)
      
      // Cache the successful result in multiple places
      const cacheData: CachedHolderData = {
        count: holderCount,
        timestamp: new Date().toISOString(),
        source: 'web-scraper'
      }
      
      // Store in memory cache (immediate)
      memoryCache = cacheData
      console.log(`🧠 Stored in memory: ${holderCount}`)
      
      // Store in file cache (persistent across requests)
      await writeFileCache(cacheData)
      
    } else if (cachedData && cachedData.count > 0) {
      finalCount = cachedData.count
      source = 'cached'
      console.log(`💾 Using cached data: ${finalCount} (scraping failed with 403)`)
    } else {
      finalCount = 1410
      source = 'fallback'
      console.log(`📊 Using hardcoded fallback: ${finalCount}`)
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
