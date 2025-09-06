"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, TrendingUp, Users, Zap, DollarSign, UserCheck, BarChart3, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { openExternalUrl } from "@/lib/farcaster-utils"

interface TokenData {
  priceUsd?: string
  priceChange24h?: number
  marketCap?: number
  holders?: number
  liquidity?: number
}

interface TokenDataApiResponse {
  holders?: number
  error?: string
  source: 'covalent-api' | 'fallback'
  lastUpdated: string
}

export function TokenInfo() {
  const contractAddress = "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
  }

  const fetchHolderCount = async (): Promise<number | undefined> => {
    try {
      console.log('🔍 Fetching holder count from server-side API...')
      
      // Use our server-side API route to avoid CORS issues
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now()
      const response = await fetch(`/api/token-data?t=${cacheBuster}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.error(`❌ Token data API HTTP error: ${response.status}`)
        return 1053 // Updated fallback based on current Basescan count
      }
      
      const data = await response.json()
      console.log('📊 Token data API response:', data)
      
      if (data.holders && typeof data.holders === 'number') {
        console.log(`✅ Fetched ${data.holders} holders from ${data.source} (updated: ${data.lastUpdated})`)
        return data.holders
      } else {
        console.error('❌ Token data API returned invalid data:', data)
        return 1053 // Updated fallback
      }
      
    } catch (error) {
      console.error('❌ Error fetching holder count from API:', error)
      return 1053 // Updated fallback based on current Basescan count
    }
  }

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const timestamp = new Date().toISOString()
        console.log(`🚀 [${timestamp}] Starting API fetch for contract:`, contractAddress)
        
        // Fetch price data from Dexscreener
        const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
        console.log('📡 Fetching from Dexscreener URL:', dexUrl)
        
        const dexResponse = await fetch(dexUrl)
        console.log('📊 Dexscreener response status:', dexResponse.status, dexResponse.statusText)
        
        // Fetch holder count from Basescan
        const holderCount = await fetchHolderCount()
        
        let dexData = {}
        if (dexResponse.ok) {
          const data = await dexResponse.json()
          console.log('✅ Dexscreener API full response:', data) // Debug log
          if (data.pairs && data.pairs.length > 0) {
            // Log all pairs to see which one we should use
            console.log('All pairs found:', data.pairs.map((p: any, i: number) => ({
              index: i,
              dexId: p.dexId,
              chainId: p.chainId,
              pairAddress: p.pairAddress,
              priceUsd: p.priceUsd,
              priceChange24h: p.priceChange?.h24,
              volume24h: p.volume?.h24,
              liquidity: p.liquidity?.usd
            })))
            
            // Find the most liquid/active pair (usually the best one to use)
            const bestPair = data.pairs.reduce((best: any, current: any) => {
              const bestLiquidity = best.liquidity?.usd || 0
              const currentLiquidity = current.liquidity?.usd || 0
              return currentLiquidity > bestLiquidity ? current : best
            })
            
            console.log('Selected best pair:', {
              dexId: bestPair.dexId,
              chainId: bestPair.chainId,
              pairAddress: bestPair.pairAddress,
              priceUsd: bestPair.priceUsd,
              priceChange: bestPair.priceChange,
              priceChange24h: bestPair.priceChange?.h24,
              rawPriceChange24h: bestPair.priceChange?.h24,
              typeOfPriceChange: typeof bestPair.priceChange?.h24,
              volume24h: bestPair.volume?.h24,
              liquidity: bestPair.liquidity?.usd,
              fdv: bestPair.fdv,
              marketCap: bestPair.marketCap
            })
            
            dexData = {
              priceUsd: bestPair.priceUsd || undefined,
              priceChange24h: bestPair.priceChange?.h24 !== undefined && bestPair.priceChange?.h24 !== null ? bestPair.priceChange.h24 : undefined,
              marketCap: typeof bestPair.fdv === 'number' ? bestPair.fdv : (typeof bestPair.marketCap === 'number' ? bestPair.marketCap : undefined),
              liquidity: typeof bestPair.liquidity?.usd === 'number' ? bestPair.liquidity.usd : undefined,
            }
            console.log('Final processed dex data:', dexData) // Debug log
          } else {
            console.log('No pairs found in Dexscreener response')
          }
        } else {
          console.error('Dexscreener API request failed:', dexResponse.status, dexResponse.statusText)
        }
        
        // Combine data from both APIs
        const combinedData = {
          ...dexData,
          holders: holderCount
        }
        
        console.log('Setting token data:', combinedData) // Debug log
        setTokenData(combinedData)
        
      } catch (error) {
        console.error('❌ Error fetching token data:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        setTokenData({}) // Set empty object on error
      } finally {
        console.log('🏁 API fetch completed, setting loading to false')
        setLoading(false)
      }
    }

    // Initial fetch
    fetchTokenData()
    
    // Refresh data every 5 minutes (blockchain RPC is more reliable than APIs)
    console.log('⏰ Setting up 5-minute refresh interval for token data')
    const interval = setInterval(() => {
      console.log('🔄 Interval triggered - fetching fresh token data...')
      fetchTokenData()
    }, 300000)
    
    return () => {
      console.log('🛑 Cleaning up token data refresh interval')
      clearInterval(interval)
    }
  }, [contractAddress])

  const formatPrice = (price: string | undefined) => {
    if (!price || price === undefined) {
      return '$0.0000'
    }
    const num = parseFloat(price)
    if (isNaN(num)) {
      return '$0.0000'
    }
    if (num < 0.01) {
      return `$${num.toFixed(6)}`
    }
    return `$${num.toFixed(4)}`
  }

  const formatMarketCap = (marketCap: number | undefined) => {
    if (!marketCap || marketCap === undefined || isNaN(marketCap)) {
      return '$0'
    }
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`
    }
    return `$${marketCap.toFixed(0)}`
  }

  const formatPriceChange = (change: number | undefined) => {
    console.log('formatPriceChange called with:', change, 'type:', typeof change)
    
    if (change === undefined || change === null || isNaN(change)) {
      console.log('Price change is undefined/null/NaN, showing default +0.00%')
      return {
        value: '+0.00%',
        className: 'text-muted-foreground'
      }
    }
    
    // Handle the case where change is 0 (which is different from undefined)
    if (change === 0) {
      console.log('Price change is exactly 0, showing 0.00%')
      return {
        value: '0.00%',
        className: 'text-muted-foreground'
      }
    }
    
    const isPositive = change > 0
    const formattedValue = `${isPositive ? '+' : ''}${change.toFixed(2)}%`
    const className = isPositive ? 'text-green-500' : 'text-red-500'
    
    console.log('Formatted price change:', formattedValue, 'className:', className)
    
    return {
      value: formattedValue,
      className: className
    }
  }

  return (
    <section id="token" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold mr-2">Meet</h2>
            <img src="/mintedmerch-logo.png" alt="$mintedmerch logo" className="w-48 h-12 sm:w-96 sm:h-24 object-cover" />
          </div>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
          The $mintedmerch token powers everything we're building. By aligning onchain utility with real world value - we're crafting a sustainable model where the community, partners, & team all win together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Become a Merch Mogul
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">Hold 50M $mintedmerch</p>
                <ul className="space-y-2 text-sm">
                  <li>• Access to collab partnerships</li>
                  <li>• Ability to create & order custom merch</li>
                  <li>• Access to the Merch Moguls chat</li>
                  <li>• 15% off store wide as long as you hold</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Collaborations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Concepts & design</li>
                <li>• Production & fulfillment</li>
                <li>• Featured listings</li>
                <li>• Cross promotions with other communities</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Built on Base
                <svg width="20" height="20" viewBox="0 0 249 249" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 19.671C0 12.9332 0 9.56425 1.26956 6.97276C2.48511 4.49151 4.49151 2.48511 6.97276 1.26956C9.56425 0 12.9332 0 19.671 0H229.329C236.067 0 239.436 0 242.027 1.26956C244.508 2.48511 246.515 4.49151 247.73 6.97276C249 9.56425 249 12.9332 249 19.671V229.329C249 236.067 249 239.436 247.73 242.027C246.515 244.508 244.508 246.515 242.027 247.73C239.436 249 236.067 249 229.329 249H19.671C12.9332 249 9.56425 249 6.97276 247.73C4.49151 246.515 2.48511 244.508 1.26956 242.027C0 239.436 0 236.067 0 229.329V19.671Z" fill="#0000FF"/>
                </svg>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Low transaction fees</li>
                <li>• Pay with USDC</li>
                <li>• Token gated discounts</li>
                <li>• Free daily onchain spins in our mini app</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-2 mb-8">
          <CardContent className="p-6">
            {/* Mobile Layout - Centered Column */}
            <div className="md:hidden text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm font-mono">{`${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`}</code>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0 hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-200">
                  {copied ? (
                    <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base')}>
                  <img src="/UniswapLogo.png" alt="Uniswap" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl(`https://basescan.org/address/${contractAddress}`)}>
                  <img src="/BasescanLogoWhiteAndBlue.png" alt="Basescan" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://clanker.world/clanker/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/ClankerLogoBars.png" alt="Clanker" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://dexscreener.com/base/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/DexscreenerLogo.png" alt="Dexscreener" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://www.geckoterminal.com/base/pools/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/GeckoTerminalLogoFullColor.png" alt="GeckoTerminal" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                Total Supply: 100,000,000,000
              </div>
            </div>

            {/* Desktop Layout - Three Columns */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{`${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`}</code>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0 hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-200">
                  {copied ? (
                    <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base')}>
                  <img src="/UniswapLogo.png" alt="Uniswap" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl(`https://basescan.org/address/${contractAddress}`)}>
                  <img src="/BasescanLogoWhiteAndBlue.png" alt="Basescan" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://clanker.world/clanker/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/ClankerLogoBars.png" alt="Clanker" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://dexscreener.com/base/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/DexscreenerLogo.png" alt="Dexscreener" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:border-primary transition-colors" onClick={() => openExternalUrl('https://www.geckoterminal.com/base/pools/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07')}>
                  <img src="/GeckoTerminalLogoFullColor.png" alt="GeckoTerminal" className="h-4 w-4 md:h-8 md:w-8" />
                </Button>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-muted-foreground">
                  Total Supply
                </div>
                <div className="text-xl font-bold text-primary">
                  100,000,000,000
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-colors text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-primary">Loading...</div>
              ) : tokenData ? (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(tokenData.priceUsd)}
                  </div>
                  <div className={`text-sm ${formatPriceChange(tokenData.priceChange24h).className}`}>
                    {formatPriceChange(tokenData.priceChange24h).value} (24h)
                  </div>
                </>
              ) : (
                <div className="text-2xl font-bold text-primary">$0.0024</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-primary">Loading...</div>
              ) : tokenData ? (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {formatMarketCap(tokenData.marketCap)}
                  </div>
                  <div className="text-sm text-muted-foreground">Fully Diluted</div>
                </>
              ) : (
                <div className="text-2xl font-bold text-primary">$2.4M</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-primary">Loading...</div>
              ) : tokenData && tokenData.liquidity ? (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {formatMarketCap(tokenData.liquidity)}
                  </div>
                  <div className="text-sm text-muted-foreground">USD Value</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">$174K</div>
                  <div className="text-sm text-muted-foreground">USD Value</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Holders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-primary">Loading...</div>
              ) : tokenData && tokenData.holders ? (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {tokenData.holders.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Holders</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">1,247</div>
                  <div className="text-sm text-muted-foreground">Total Holders</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
