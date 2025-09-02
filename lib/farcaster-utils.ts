/**
 * Opens a URL in external browser, using Farcaster SDK if available, fallback to window.open
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    // Try to use Farcaster SDK first
    const { sdk } = await import('@farcaster/miniapp-sdk')
    await sdk.actions.openUrl(url)
  } catch (error) {
    // Fallback to window.open for non-Mini App contexts
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Opens shop URL with smart routing - Mini App context goes to app.mintedmerch.shop, 
 * regular context goes to mintedmerch.shop
 */
export async function openShopUrl(): Promise<void> {
  try {
    // Try to use Farcaster SDK first (Mini App context)
    const { sdk } = await import('@farcaster/miniapp-sdk')
    await sdk.actions.openUrl('https://app.mintedmerch.shop/')
  } catch (error) {
    // Fallback to regular shop for non-Mini App contexts
    window.open('https://mintedmerch.shop/', '_blank', 'noopener,noreferrer')
  }
}
