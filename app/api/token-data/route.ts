import { NextResponse } from 'next/server'

interface BasescanResponse {
  status: string
  message: string
  result: Array<{
    TokenHolderAddress: string
    TokenHolderQuantity: string
  }>
}

interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'basescan-api' | 'fallback'
  lastUpdated: string
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Fetching holder count from Basescan API...`)
    
    // Fetch from Basescan API server-side to avoid CORS issues
    const basescanUrl = `https://api.basescan.org/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=10000`
    
    const response = await fetch(basescanUrl, {
      headers: {
        'User-Agent': 'MintedMerch-TokenSite/1.0'
      },
      // Disable caching to ensure fresh data
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`❌ Basescan API HTTP error: ${response.status} ${response.statusText}`)
      return NextResponse.json({
        holders: 1053, // Updated fallback based on current Basescan count
        error: `HTTP ${response.status}`,
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
    }
    
    const data: BasescanResponse = await response.json()
    console.log('📊 Basescan API response status:', data.status, 'message:', data.message)
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      const holderCount = data.result.length
      console.log(`✅ Successfully fetched ${holderCount} holders from Basescan API`)
      
      const response = NextResponse.json({
        holders: holderCount,
        source: 'basescan-api',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
      
      // Set cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    } else {
      console.error('❌ Basescan API returned error:', data.message || 'Unknown error')
      const response = NextResponse.json({
        holders: 1053, // Updated fallback
        error: data.message || 'API returned invalid data',
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
      
      // Set cache control headers for fallback too
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }
    
  } catch (error) {
    console.error('❌ Error fetching from Basescan API:', error)
    const response = NextResponse.json({
      holders: 1053, // Updated fallback based on current Basescan count
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers for error case too
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
}
