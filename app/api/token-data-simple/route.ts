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

// Rate limiting to avoid getting blocked
let lastScrapeTime = 0
const MIN_SCRAPE_INTERVAL = 30000 // 30 seconds between scrapes

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

// Helper function for extraction
function extractHolderCount(html: string): number | null {
  const patterns = [
    /Holders?:\s*([0-9,]+)/i,
    /([0-9,]+)\s*Holders?/i,
    /"holders?"[:\s]*"?([0-9,]+)"?/i
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const numberStr = match[1].replace(/,/g, '')
      const parsedNumber = parseInt(numberStr, 10)
      
      if (!isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 1000000) {
        return parsedNumber
      }
    }
  }
  return null
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
    
    // Check rate limiting - don't scrape too frequently
    const now = Date.now()
    const timeSinceLastScrape = now - lastScrapeTime
    let shouldScrape = timeSinceLastScrape > MIN_SCRAPE_INTERVAL
    
    if (!shouldScrape && cachedData) {
      console.log(`⏰ Rate limited (${Math.round((MIN_SCRAPE_INTERVAL - timeSinceLastScrape) / 1000)}s remaining), using cache`)
    }
    
    // Try multiple scraping methods for better reliability
    let holderCount: number | null = null
    
    // Only scrape if rate limit allows or no cache available
    if (shouldScrape || !cachedData) {
      lastScrapeTime = now // Update last scrape time
      
      // Method 1: Direct fetch with rotating user agents
      const userAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
      
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)]
      
      try {
        console.log('🔄 Method 1: Direct fetch with random UA...')
        
        // Random delay to avoid pattern detection
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))
        
        const response = await fetch(`https://basescan.org/token/${contractAddress}`, {
          headers: {
            'User-Agent': randomUA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(12000)
        })
        
        console.log(`📊 Direct response: ${response.status}`)
        
        if (response.ok) {
          const html = await response.text()
          console.log(`📄 HTML length: ${html.length}`)
          holderCount = extractHolderCount(html)
          if (holderCount) {
            console.log(`✅ Method 1 success: ${holderCount}`)
          }
        }
      } catch (error) {
        console.log('⚠️ Method 1 failed:', error)
      }
      
      // Method 2: Proxy fallback if direct fails
      if (!holderCount) {
        try {
          console.log('🌐 Method 2: Proxy fallback...')
          
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://basescan.org/token/${contractAddress}`)}`
          
          const proxyResponse = await fetch(proxyUrl, {
            headers: {
              'User-Agent': randomUA,
              'Accept': 'application/json'
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(15000)
          })
          
          console.log(`📊 Proxy response: ${proxyResponse.status}`)
          
          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json()
            if (proxyData.contents) {
              console.log(`📄 Proxy HTML length: ${proxyData.contents.length}`)
              holderCount = extractHolderCount(proxyData.contents)
              if (holderCount) {
                console.log(`✅ Method 2 success: ${holderCount}`)
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Method 2 failed:', error)
        }
      }
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