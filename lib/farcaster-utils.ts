/**
 * Detects if we're in a Farcaster Mini App context
 */
function isFarcasterContext(): boolean {
  if (typeof window === 'undefined') return false
  // Check for Farcaster-specific indicators
  return !!(window as any).farcaster || 
         window.location.href.includes('farcaster.xyz') ||
         (window as any).webkit?.messageHandlers?.farcaster
}

/**
 * Opens a URL in external browser, using Farcaster SDK if available, fallback to window.open
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isFarcasterContext()) {
    try {
      // Try to use Farcaster SDK in Mini App context
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl(url)
      return
    } catch (error) {
      console.warn('Failed to use Farcaster SDK, falling back to window.open:', error)
    }
  }
  
  // Fallback to window.open for non-Mini App contexts or if SDK fails
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Opens shop URL with smart routing - Mini App context goes to Farcaster Mini App, 
 * regular context goes to mintedmerch.shop
 */
export async function openShopUrl(): Promise<void> {
  if (isFarcasterContext()) {
    try {
      // Try to use Farcaster SDK in Mini App context
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
      return
    } catch (error) {
      console.warn('Failed to use Farcaster SDK for shop URL, falling back to regular shop:', error)
    }
  }
  
  // Fallback to regular shop for non-Mini App contexts or if SDK fails
  window.open('https://mintedmerch.shop/', '_blank', 'noopener,noreferrer')
}

/**
 * Opens Mini App URL - always goes to Farcaster Mini App regardless of context
 */
export async function openMiniAppUrl(): Promise<void> {
  if (isFarcasterContext()) {
    try {
      // In Mini App context, just open the URL
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
      return
    } catch (error) {
      console.warn('Failed to use Farcaster SDK for Mini App URL, falling back to window.open:', error)
    }
  }
  
  // In regular web context, open in new tab
  window.open('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch', '_blank', 'noopener,noreferrer')
}

/**
 * Handles Buy token action - uses swapToken in Mini App context, external link otherwise
 */
export async function buyToken(): Promise<void> {
  if (isFarcasterContext()) {
    try {
      // Use swapToken in Mini App context
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.swapToken({
        buyToken: 'eip155:8453/erc20:0x774EAeFE73Df7959496Ac92a77279A8D7d690b07', // $mintedmerch token on Base
        sellToken: 'eip155:8453/native', // ETH on Base
      })
      return
    } catch (error) {
      console.warn('Failed to use Farcaster swapToken, falling back to external URL:', error)
    }
  }
  
  // Fallback to Uniswap for non-Mini App contexts or if swapToken fails
  window.open('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base', '_blank', 'noopener,noreferrer')
}
