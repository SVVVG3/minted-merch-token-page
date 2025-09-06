import { NextResponse } from 'next/server'

interface TokenDataResponse {
  holders?: number
  error?: string
  source: 'blockchain-rpc' | 'fallback'
  lastUpdated: string
}

interface RpcResponse {
  jsonrpc: string
  id: number
  result?: string
  error?: {
    code: number
    message: string
  }
}

export async function GET() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  
  // Helper function to make RPC calls with retry logic
  const makeRpcCall = async (method: string, params: any[], retries = 3): Promise<RpcResponse> => {
    const rpcEndpoints = [
      'https://mainnet.base.org',
      'https://base-mainnet.public.blastapi.io',
      'https://base.llamarpc.com'
    ]
    
    for (let endpoint of rpcEndpoints) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method,
              params,
              id: 1
            }),
            cache: 'no-store'
          })
          
          if (response.ok) {
            const data: RpcResponse = await response.json()
            if (data.error) {
              throw new Error(`RPC Error: ${data.error.message}`)
            }
            return data
          }
          
          // If not the last retry, wait before trying again
          if (i < retries - 1) {
            const delay = Math.pow(2, i) * 500 // Exponential backoff: 0.5s, 1s, 2s
            console.log(`⏳ Retrying RPC call in ${delay}ms (attempt ${i + 2}/${retries})...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } catch (error) {
          console.error(`❌ RPC attempt ${i + 1} failed on ${endpoint}:`, error)
          if (i === retries - 1) {
            console.log(`🔄 Trying next RPC endpoint...`)
            break // Try next endpoint
          }
        }
      }
    }
    
    throw new Error(`All RPC endpoints failed after ${retries} attempts each`)
  }
  
  try {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] Fetching holder count via blockchain RPC...`)
    
    // Get total supply first to understand the token
    console.log('📊 Getting total supply...')
    const totalSupplyResponse = await makeRpcCall('eth_call', [
      {
        to: contractAddress,
        data: '0x18160ddd' // totalSupply() function selector
      },
      'latest'
    ])
    
    const totalSupply = parseInt(totalSupplyResponse.result || '0x0', 16)
    console.log(`📈 Total supply: ${totalSupply}`)
    
    // For ERC20 tokens, we need to use events to count holders
    // Get Transfer events from block 0 to latest to count unique holders
    console.log('🔍 Fetching Transfer events to count holders...')
    
    // Get logs for Transfer events: Transfer(address indexed from, address indexed to, uint256 value)
    const transferLogsResponse = await makeRpcCall('eth_getLogs', [{
      fromBlock: '0x0',
      toBlock: 'latest',
      address: contractAddress,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
      ]
    }])
    
    if (!transferLogsResponse.result || !Array.isArray(transferLogsResponse.result)) {
      throw new Error('Invalid transfer logs response')
    }
    
    // Count unique holders from transfer events
    const holders = new Set<string>()
    const logs = transferLogsResponse.result as any[]
    
    console.log(`📋 Processing ${logs.length} transfer events...`)
    
    for (const log of logs) {
      if (log.topics && log.topics.length >= 3) {
        const to = log.topics[2] // 'to' address is the second indexed parameter
        if (to && to !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          // Convert topic to address format
          const address = '0x' + to.slice(-40)
          holders.add(address.toLowerCase())
        }
      }
    }
    
    const holderCount = holders.size
    console.log(`✅ Successfully counted ${holderCount} unique holders from blockchain RPC`)
    
    const response = NextResponse.json({
      holders: holderCount,
      source: 'blockchain-rpc',
      lastUpdated: new Date().toISOString()
    } as TokenDataResponse)
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('❌ Error fetching holder count via blockchain RPC:', error)
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
