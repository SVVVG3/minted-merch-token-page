/**
 * Detects if we're in a Farcaster Mini App context
 */
async function isFarcasterContext(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    // Try to import the SDK and check if we can access it
    const { sdk } = await import('@farcaster/miniapp-sdk')
    
    // Try to use isInMiniApp if it exists
    if (typeof sdk.context?.isInMiniApp === 'function') {
      const result = await sdk.context.isInMiniApp()
      console.log('🔍 SDK isInMiniApp result:', result)
      return result
    }
    
    // Alternative: try to call ready() to see if we're in Mini App context
    if (sdk.actions?.ready) {
      console.log('🔍 SDK detected, assuming Mini App context')
      return true
    }
    
    console.log('🔍 SDK imported but no Mini App methods found')
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
    console.log('🔧 DEBUG: SDK context:', Object.keys(sdk.context || {}))
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
