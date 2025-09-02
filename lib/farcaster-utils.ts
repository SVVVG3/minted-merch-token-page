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
