import { NextResponse } from 'next/server'


interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'covalent-api' | 'fallback'
  lastUpdated: string
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Fetching holder count from Covalent API...`)
    
    // Get Covalent API key from environment variables
    const covalentApiKey = process.env.COVALENT_API_KEY
    
    if (!covalentApiKey) {
      console.warn('⚠️ COVALENT_API_KEY not found in environment variables')
      throw new Error('Covalent API key required')
    }
    
    // Covalent API endpoint for Base network (chain ID: 8453)
    // Get token holders for the contract
    const covalentUrl = `https://api.covalenthq.com/v1/base-mainnet/tokens/${contractAddress}/token_holders_v2/?page-size=1`
    
    console.log('📡 Making Covalent API request...')
    
    const response = await fetch(covalentUrl, {
      headers: {
        'Authorization': `Bearer ${covalentApiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`❌ Covalent API HTTP error: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📊 Covalent API response:', JSON.stringify(data, null, 2))
    
    let holderCount: number
    
    if (data.data && data.data.pagination && data.data.pagination.total_count !== undefined) {
      holderCount = data.data.pagination.total_count
      console.log(`✅ Successfully fetched ${holderCount} holders from Covalent API`)
    } else if (data.data && data.data.items && Array.isArray(data.data.items)) {
      // Fallback: if no pagination info, use items length (though this would be incomplete)
      holderCount = data.data.items.length
      console.log(`⚠️ Using sample count from Covalent: ${holderCount} holders (may be incomplete)`)
    } else {
      console.error('❌ Unexpected Covalent API response format')
      throw new Error('Invalid API response format')
    }
      
    const apiResponse = NextResponse.json({
      holders: holderCount,
      source: 'covalent-api',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers to prevent caching
    apiResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    apiResponse.headers.set('Pragma', 'no-cache')
    apiResponse.headers.set('Expires', '0')
    
    return apiResponse
    
  } catch (error) {
    console.error('❌ Error fetching from Covalent API:', error)
    
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
