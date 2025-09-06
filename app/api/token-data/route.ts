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
    
    // Get API key from environment variables
    const apiKey = process.env.BASESCAN_API_KEY
    
    if (!apiKey) {
      console.warn('⚠️ BASESCAN_API_KEY not found in environment variables')
      throw new Error('API key required')
    }
    
    // Fetch from Basescan API with your API key
    const basescanUrl = `https://api.basescan.org/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=1&offset=10000&apikey=${apiKey}`
    
    console.log('📡 Making Basescan API request...')
    
    const response = await fetch(basescanUrl, {
      headers: {
        'User-Agent': 'MintedMerch-TokenSite/1.0'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`❌ Basescan API HTTP error: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: BasescanResponse = await response.json()
    console.log('📊 Basescan API response status:', data.status, 'message:', data.message)
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      const holderCount = data.result.length
      console.log(`✅ Successfully fetched ${holderCount} holders from Basescan API`)
      
      const apiResponse = NextResponse.json({
        holders: holderCount,
        source: 'basescan-api',
        lastUpdated: new Date().toISOString()
      } as TokenDataResponse)
      
      // Set cache control headers to prevent caching
      apiResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      apiResponse.headers.set('Pragma', 'no-cache')
      apiResponse.headers.set('Expires', '0')
      
      return apiResponse
    } else {
      // Handle Basescan API errors
      let errorMessage = data.message || 'Unknown API error'
      
      if (data.message === 'NOTOK') {
        errorMessage = 'Basescan API returned NOTOK - check API key or rate limits'
      }
      
      console.error('❌ Basescan API error:', errorMessage)
      throw new Error(errorMessage)
    }
    
  } catch (error) {
    console.error('❌ Error fetching from Basescan API:', error)
    
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
