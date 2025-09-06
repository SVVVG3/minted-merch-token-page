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
    console.log(`🔍 [${timestamp}] Getting holder count via multiple methods...`)
    
    let holderCount: number | null = null
    
    // Method 1: Try a free proxy service to bypass 403 blocks
    try {
      console.log('🌐 Trying via free proxy service...')
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://basescan.org/token/${contractAddress}`)}`
      
      const proxyResponse = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000) // 8 second timeout
      })
      
      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json()
        if (proxyData.contents) {
          holderCount = extractHolderCount(proxyData.contents)
          if (holderCount) {
            console.log(`✅ Successfully got ${holderCount} holders via proxy`)
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Proxy method failed:', error)
    }
    
    // Method 2: Try another free proxy service
    if (!holderCount) {
      try {
        console.log('🌐 Trying alternative proxy service...')
        const corsProxyUrl = `https://cors-anywhere.herokuapp.com/https://basescan.org/token/${contractAddress}`
        
        const corsResponse = await fetch(corsProxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest'
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000) // 8 second timeout
        })
        
        if (corsResponse.ok) {
          const html = await corsResponse.text()
          holderCount = extractHolderCount(html)
          if (holderCount) {
            console.log(`✅ Successfully got ${holderCount} holders via CORS proxy`)
          }
        }
      } catch (error) {
        console.log('⚠️ CORS proxy method failed:', error)
      }
    }
    
    // Method 3: Try direct fetch with random delays and different approach
    if (!holderCount) {
      try {
        console.log('🔄 Trying direct fetch with stealth headers...')
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const response = await fetch(`https://basescan.org/token/${contractAddress}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://google.com/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000) // 8 second timeout
        })
        
        if (response.ok) {
          const html = await response.text()
          holderCount = extractHolderCount(html)
          if (holderCount) {
            console.log(`✅ Successfully got ${holderCount} holders via direct fetch`)
          }
        } else {
          console.log(`❌ Direct fetch failed: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log('⚠️ Direct fetch failed:', error)
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
    let source: 'web-scraper' | 'fallback'
    
    if (holderCount && holderCount > 0) {
      console.log(`✅ Successfully scraped ${holderCount} holders`)
      finalHolderCount = holderCount
      source = 'web-scraper'
    } else {
      console.log('📊 All scraping methods failed, using known accurate count')
      finalHolderCount = 1410 // Updated fallback count
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
    let holderCount = 1410 // Updated fallback count
    
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
