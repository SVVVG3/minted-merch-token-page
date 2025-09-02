/**
 * Detects if we're in a Farcaster Mini App context
 */
async function isFarcasterContext(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    // Import the SDK and check if we have a valid context
    const { sdk } = await import('@farcaster/miniapp-sdk')
    
    // Check if we have a valid Mini App context
    if (sdk.context && typeof sdk.context === 'object') {
      // If we have user info or client info, we're definitely in a Mini App
      const hasUser = sdk.context.user && typeof sdk.context.user.fid === 'number'
      const hasClient = sdk.context.client && typeof sdk.context.client.clientFid === 'number'
      
      if (hasUser || hasClient) {
        console.log('🔍 Mini App context detected via SDK context:', {
          user: !!hasUser,
          client: !!hasClient,
          userFid: sdk.context.user?.fid,
          clientFid: sdk.context.client?.clientFid
        })
        return true
      }
    }
    
    // If context is empty but SDK loaded, we might still be in Mini App
    if (sdk.actions?.ready) {
      console.log('🔍 SDK actions available, likely Mini App context')
      return true
    }
    
    console.log('🔍 SDK imported but no valid context found')
    return false
  } catch (error) {
    console.log('🔍 SDK import failed, using fallback detection:', error)
    // Fallback detection methods
    const fallbackResult = !!(window as any).farcaster || 
           window.location.href.includes('farcaster.xyz') ||
           (window as any).webkit?.messageHandlers?.farcaster ||
           window.navigator.userAgent.includes('Farcaster')
    
    console.log('🔍 Fallback detection result:', fallbackResult)
    return fallbackResult
  }
}

/**
 * Test function to debug Mini App context - call this from console
 */
export async function debugMiniAppContext(): Promise<void> {
  console.log('🔧 DEBUG: Testing Mini App context detection...')
  const isMiniApp = await isFarcasterContext()
  console.log('🔧 DEBUG: isMiniApp result:', isMiniApp)
  
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk')
    console.log('🔧 DEBUG: SDK imported successfully:', !!sdk)
    console.log('🔧 DEBUG: SDK actions:', Object.keys(sdk.actions || {}))
    console.log('🔧 DEBUG: SDK context keys:', Object.keys(sdk.context || {}))
    console.log('🔧 DEBUG: Full SDK context:', sdk.context)
    
    if (sdk.context?.user) {
      console.log('🔧 DEBUG: User context:', {
        fid: sdk.context.user.fid,
        username: sdk.context.user.username,
        displayName: sdk.context.user.displayName
      })
    }
    
    if (sdk.context?.client) {
      console.log('🔧 DEBUG: Client context:', {
        platformType: sdk.context.client.platformType,
        clientFid: sdk.context.client.clientFid,
        added: sdk.context.client.added
      })
    }
    
    if (sdk.context?.location) {
      console.log('🔧 DEBUG: Location context:', sdk.context.location)
    }
  } catch (error) {
    console.log('🔧 DEBUG: SDK import failed:', error)
  }
}

/**
 * Opens a URL in external browser - uses SDK in Mini App context, window.open otherwise
 */
export async function openExternalUrl(url: string): Promise<void> {
  console.log('🔗 openExternalUrl called with:', url)
  const isMiniApp = await isFarcasterContext()
  console.log('🔗 Mini App context detected:', isMiniApp)
  
  if (isMiniApp) {
    try {
      // In Mini App context, use SDK to open in external browser
      const { sdk } = await import('@farcaster/miniapp-sdk')
      console.log('🔗 Attempting to use SDK openUrl...')
      await sdk.actions.openUrl(url)
      console.log('✅ Opened external URL via Farcaster SDK:', url)
      return
    } catch (error) {
      console.warn('❌ Failed to use Farcaster SDK for external URL, falling back to window.open:', error)
    }
  }
  
  // Fallback to window.open for non-Mini App contexts or if SDK fails
  console.log('🔗 Using window.open fallback...')
  window.open(url, '_blank', 'noopener,noreferrer')
  console.log('✅ Opened external URL via window.open:', url)
}

/**
 * Opens shop URL with smart routing - Mini App context goes to Farcaster Mini App, 
 * regular context goes to mintedmerch.shop
 */
export async function openShopUrl(): Promise<void> {
  const isMiniApp = await isFarcasterContext()
  
  if (isMiniApp) {
    try {
      // In Mini App context, open the Farcaster Mini App URL
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
      console.log('✅ Opened shop via Farcaster SDK (Mini App)')
      return
    } catch (error) {
      console.warn('❌ Failed to use Farcaster SDK for shop URL, falling back to regular shop:', error)
    }
  }
  
  // Fallback to regular shop for non-Mini App contexts or if SDK fails
  window.open('https://mintedmerch.shop/', '_blank', 'noopener,noreferrer')
  console.log('✅ Opened shop via window.open (regular web)')
}

/**
 * Opens Mini App URL - always goes to Farcaster Mini App regardless of context
 */
export async function openMiniAppUrl(): Promise<void> {
  const isMiniApp = await isFarcasterContext()
  
  if (isMiniApp) {
    try {
      // In Mini App context, open the URL (might navigate within or open externally)
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
      console.log('✅ Opened Mini App URL via Farcaster SDK')
      return
    } catch (error) {
      console.warn('❌ Failed to use Farcaster SDK for Mini App URL, falling back to window.open:', error)
    }
  }
  
  // In regular web context, open in new tab
  window.open('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch', '_blank', 'noopener,noreferrer')
  console.log('✅ Opened Mini App URL via window.open (regular web)')
}

/**
 * Handles Buy token action - uses swapToken in Mini App context, external link otherwise
 */
export async function buyToken(): Promise<void> {
  const isMiniApp = await isFarcasterContext()
  
  if (isMiniApp) {
    try {
      // Use swapToken in Mini App context
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.swapToken({
        buyToken: 'eip155:8453/erc20:0x774EAeFE73Df7959496Ac92a77279A8D7d690b07', // $mintedmerch token on Base
        sellToken: 'eip155:8453/native', // ETH on Base
      })
      console.log('✅ Opened swap via Farcaster SDK (Mini App)')
      return
    } catch (error) {
      console.warn('❌ Failed to use Farcaster swapToken, falling back to external URL:', error)
    }
  }
  
  // Fallback to Uniswap for non-Mini App contexts or if swapToken fails
  window.open('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base', '_blank', 'noopener,noreferrer')
  console.log('✅ Opened Uniswap via window.open (regular web)')
}
