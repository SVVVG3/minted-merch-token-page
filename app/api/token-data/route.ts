import { NextResponse } from 'next/server'

interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'live-update' | 'fallback'
  lastUpdated: string
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Fetching live holder count...`)
    
    // For a production-ready solution, we need to use a service that indexes blockchain data
    // Let's try a few different approaches in order of preference:
    
    // 1. Try Moralis API (they have good Base support and holder counts)
    try {
      console.log('📊 Trying Moralis API...')
      const moralisResponse = await fetch(`https://deep-index.moralis.io/api/v2/erc20/${contractAddress}/owners?chain=base&limit=1`, {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY || 'demo'
        },
        cache: 'no-store'
      })
      
      if (moralisResponse.ok) {
        const moralisData = await moralisResponse.json()
        if (moralisData && moralisData.total) {
          const holderCount = moralisData.total
          console.log(`✅ Got ${holderCount} holders from Moralis API`)
          
          const response = NextResponse.json({
            holders: holderCount,
            source: 'live-update',
            lastUpdated: new Date().toISOString()
          } as TokenDataResponse)
          
          response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
          response.headers.set('Pragma', 'no-cache')
          response.headers.set('Expires', '0')
          
          return response
        }
      }
    } catch (error) {
      console.log('⚠️ Moralis API not available:', error)
    }
    
    // 2. Try Alchemy API (also has good Base support)
    try {
      console.log('📊 Trying Alchemy API...')
      const alchemyApiKey = process.env.ALCHEMY_API_KEY
      if (alchemyApiKey) {
        const alchemyResponse = await fetch(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}/getOwnersForToken`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contractAddress: contractAddress,
            withTokenBalances: false
          }),
          cache: 'no-store'
        })
        
        if (alchemyResponse.ok) {
          const alchemyData = await alchemyResponse.json()
          if (alchemyData && alchemyData.owners) {
            const holderCount = alchemyData.owners.length
            console.log(`✅ Got ${holderCount} holders from Alchemy API`)
            
            const response = NextResponse.json({
              holders: holderCount,
              source: 'live-update',
              lastUpdated: new Date().toISOString()
            } as TokenDataResponse)
            
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
            response.headers.set('Pragma', 'no-cache')
            response.headers.set('Expires', '0')
            
            return response
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Alchemy API not available:', error)
    }
    
    // 3. Fallback to known accurate count with timestamp
    console.log('📊 Using fallback with known accurate count')
    let holderCount = 1053 // Most recent accurate count from Basescan
    
    const response = NextResponse.json({
      holders: holderCount,
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('❌ Error fetching holder count:', error)
    const response = NextResponse.json({
      holders: 1053, // Updated fallback based on current count
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
