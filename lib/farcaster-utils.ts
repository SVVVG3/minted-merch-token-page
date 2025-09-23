/**
 * Detects if we're in a Farcaster Mini App context using official SDK method
 */
async function isFarcasterContext(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    // Use the official SDK method for detection
    const { sdk } = await import('@farcaster/miniapp-sdk')
    const isMiniApp = await sdk.isInMiniApp()
    console.log('🔍 Official SDK isInMiniApp result:', isMiniApp)
    return isMiniApp
  } catch (error) {
    console.log('🔍 SDK isInMiniApp failed, using fallback detection:', error)
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
 * Test different link opening methods - call this from console
 */
export async function testLinkMethods(): Promise<void> {
  const testUrl = 'https://google.com'
  console.log('🧪 TESTING: Different link opening methods...')
  
  // Method 1: window.open
  console.log('🧪 TEST 1: window.open()')
  try {
    const result = window.open(testUrl, '_blank', 'noopener,noreferrer')
    console.log('🧪 TEST 1 result:', result)
  } catch (error) {
    console.log('🧪 TEST 1 error:', error)
  }
  
  // Method 2: SDK openUrl
  console.log('🧪 TEST 2: sdk.actions.openUrl()')
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk')
    await sdk.actions.openUrl(testUrl)
    console.log('🧪 TEST 2: SDK openUrl called')
  } catch (error) {
    console.log('🧪 TEST 2 error:', error)
  }
  
  // Method 3: Create and click a link element (like the working buttons)
  console.log('🧪 TEST 3: Create and click <a> element')
  try {
    const link = document.createElement('a')
    link.href = testUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log('🧪 TEST 3: Link element clicked')
  } catch (error) {
    console.log('🧪 TEST 3 error:', error)
  }
  
  // Method 4: window.location
  console.log('🧪 TEST 4: window.location (will navigate current page)')
  console.log('🧪 TEST 4: Skipping to avoid navigation')
}

/**
 * Opens a URL in external browser - tries multiple approaches
 */
export async function openExternalUrl(url: string): Promise<void> {
  console.log('🔗 openExternalUrl called with:', url)
  const isMiniApp = await isFarcasterContext()
  console.log('🔗 Mini App context detected:', isMiniApp)
  
  if (isMiniApp) {
    try {
      // In Mini App context, try the SDK method first
      const { sdk } = await import('@farcaster/miniapp-sdk')
      console.log('🔗 Attempting SDK openUrl...')
      await sdk.actions.openUrl(url)
      console.log('✅ Opened external URL via SDK openUrl:', url)
      return
    } catch (error) {
      console.warn('❌ SDK openUrl failed, trying alternatives:', error)
    }
  }
  
  // Fallback for desktop - use window.open to open in new tab
  console.log('🔗 Using window.open for desktop (new tab)...')
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
      // In Mini App context, use openMiniApp for proper Mini App-to-Mini App navigation
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openMiniApp({
        url: 'https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch'
      })
      console.log('✅ Opened shop Mini App via sdk.actions.openMiniApp() - current app will close')
      return
    } catch (error) {
      console.warn('❌ Failed to use openMiniApp, trying openUrl fallback:', error)
      try {
        // Fallback to openUrl if openMiniApp fails
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
        console.log('✅ Opened shop via openUrl fallback (Mini App)')
        return
      } catch (urlError) {
        console.warn('❌ Both openMiniApp and openUrl failed, falling back to regular shop:', urlError)
      }
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
      // In Mini App context, use openMiniApp for proper navigation
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openMiniApp({
        url: 'https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch'
      })
      console.log('✅ Opened Mini App via sdk.actions.openMiniApp() - current app will close')
      return
    } catch (error) {
      console.warn('❌ Failed to use openMiniApp, trying openUrl fallback:', error)
      try {
        // Fallback to openUrl if openMiniApp fails
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.openUrl('https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch')
        console.log('✅ Opened Mini App via openUrl fallback')
        return
      } catch (urlError) {
        console.warn('❌ Both openMiniApp and openUrl failed, falling back to window.open:', urlError)
      }
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
  
  // Fallback to Matcha for non-Mini App contexts or if swapToken fails
  window.open('https://matcha.xyz/tokens/base/0x774eaefe73df7959496ac92a77279a8d7d690b07', '_blank', 'noopener,noreferrer')
  console.log('✅ Opened Matcha via window.open (regular web)')
}

/**
 * Opens community URL with smart routing - Mini App goes to Farcaster channel, regular web goes to Cura
 */
export async function openCommunityUrl(): Promise<void> {
  const isMiniApp = await isFarcasterContext()
  
  if (isMiniApp) {
    try {
      // In Mini App context, open the Farcaster channel
      const { sdk } = await import('@farcaster/miniapp-sdk')
      await sdk.actions.openUrl('https://farcaster.xyz/~/channel/mintedmerch')
      console.log('✅ Opened Farcaster channel via SDK (Mini App)')
      return
    } catch (error) {
      console.warn('❌ Failed to use Farcaster SDK for channel URL, falling back to external:', error)
    }
  }
  
  // Fallback to Cura network for non-Mini App contexts or if SDK fails
  window.open('https://cura.network/mintedmerch?t=hot', '_blank', 'noopener,noreferrer')
  console.log('✅ Opened Cura community via window.open (regular web)')
}
