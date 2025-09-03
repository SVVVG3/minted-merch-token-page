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
    console.log('🔍 Fetching holder count from Basescan API...')
    
    // Fetch from Basescan API server-side to avoid CORS issues
    const basescanUrl = `https://api.basescan.org/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=10000`
    
    const response = await fetch(basescanUrl, {
      headers: {
        'User-Agent': 'MintedMerch-TokenSite/1.0'
      }
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
      
      return NextResponse.json({
        holders: holderCount,
        source: 'basescan-api',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
    } else {
      console.error('❌ Basescan API returned error:', data.message || 'Unknown error')
      return NextResponse.json({
        holders: 1053, // Updated fallback
        error: data.message || 'API returned invalid data',
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
    }
    
  } catch (error) {
    console.error('❌ Error fetching from Basescan API:', error)
    return NextResponse.json({
      holders: 1053, // Updated fallback based on current Basescan count
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
  }
}
