import { NextResponse } from 'next/server'


interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'web-scraper' | 'fallback'
  lastUpdated: string
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Scraping holder count from Basescan website...`)
    
    // Basescan token page URL
    const basescanUrl = `https://basescan.org/token/${contractAddress}`
    
    console.log('🌐 Fetching Basescan page HTML...')
    
    // Fetch the HTML content from Basescan
    const response = await fetch(basescanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`❌ Basescan HTTP error: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    console.log('📄 Successfully fetched Basescan page HTML')
    
    // Parse the HTML to extract holder count
    // Look for patterns like "Holders: 1,053" or similar
    let holderCount: number
    
    // Try multiple regex patterns to find holder count
    const patterns = [
      /Holders?[:\s]*([0-9,]+)/i,
      /([0-9,]+)\s*Holders?/i,
      /"holders?"[:\s]*"?([0-9,]+)"?/i,
      /holder[s]?[^0-9]*([0-9,]+)/i
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        const numberStr = match[1].replace(/,/g, '') // Remove commas
        const parsedNumber = parseInt(numberStr, 10)
        
        if (!isNaN(parsedNumber) && parsedNumber > 0) {
          holderCount = parsedNumber
          console.log(`✅ Successfully scraped ${holderCount} holders from Basescan (pattern: ${pattern})`)
          found = true
          break
        }
      }
    }
    
    if (!found) {
      console.error('❌ Could not find holder count in HTML')
      console.log('📄 HTML sample:', html.substring(0, 1000) + '...')
      throw new Error('Failed to parse holder count from HTML')
    }
      
    const apiResponse = NextResponse.json({
      holders: holderCount,
      source: 'web-scraper',
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
    let holderCount = 1053 // Most recent accurate count
    
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
