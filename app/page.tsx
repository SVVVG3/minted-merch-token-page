'use client'

import { useEffect } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  // Call ready() properly for Farcaster Mini App
  useEffect(() => {
    const initializeFarcasterApp = async () => {
      try {
        // Check if we're in a Farcaster context
        if (typeof window === 'undefined') return
        
        console.log('🔄 Initializing Farcaster Mini App...')
        
        // Expose debug function globally for testing
        const { debugMiniAppContext } = await import('@/lib/farcaster-utils')
        ;(window as any).debugMiniAppContext = debugMiniAppContext
        console.log('🔧 Debug function exposed: window.debugMiniAppContext()')
        
        // Import and initialize the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Wait for DOM to be fully ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true })
          })
        }
        
        // Small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Call ready to dismiss splash screen
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready() called - splash screen should dismiss')
        
      } catch (error) {
        console.error('❌ Error initializing Farcaster Mini App:', error)
        // Still try to call ready even if there's an error
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          await sdk.actions.ready()
          console.log('✅ Fallback ready() called')
        } catch (fallbackError) {
          console.error('❌ Fallback ready() also failed:', fallbackError)
        }
      }
    }
    
    initializeFarcasterApp()
  }, [])
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main>
        <HeroSection />
        <TokenInfo />
        <MerchShowcase />
        <CommunityPosts />
      </main>
      <Footer />
    </div>
  )
}
