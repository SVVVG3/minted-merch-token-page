import { NextResponse } from 'next/server'

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  try {
    console.log('🧪 [TEST] Starting manual scraping test...')
    
    // Test direct fetch to Basescan
    const testUrl = `https://basescan.org/token/${contractAddress}`
    console.log('🧪 [TEST] Testing direct fetch to:', testUrl)
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    
    console.log('🧪 [TEST] Response status:', response.status, response.statusText)
    console.log('🧪 [TEST] Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const html = await response.text()
      console.log('🧪 [TEST] HTML length:', html.length)
      console.log('🧪 [TEST] HTML sample (first 1000 chars):', html.substring(0, 1000))
      
      // Test extraction patterns (same as main API)
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
      
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]
        const match = html.match(pattern)
        console.log(`🧪 [TEST] Pattern ${i + 1} (${pattern}):`, match ? `Found "${match[1]}"` : 'No match')
      }
      
      return NextResponse.json({
        success: true,
        status: response.status,
        htmlLength: html.length,
        htmlSample: html.substring(0, 1000),
        message: 'Check server logs for detailed pattern matching results'
      })
    } else {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        message: 'Failed to fetch Basescan page'
      })
    }
    
  } catch (error) {
    console.error('🧪 [TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Check server logs for detailed error information'
    })
  }
}
