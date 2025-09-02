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
        
        // Expose debug functions globally for testing
        const { debugMiniAppContext, testLinkMethods } = await import('@/lib/farcaster-utils')
        ;(window as any).debugMiniAppContext = debugMiniAppContext
        ;(window as any).testLinkMethods = testLinkMethods
        console.log('🔧 Debug functions exposed: window.debugMiniAppContext() and window.testLinkMethods()')
        
        // TEMPORARILY DISABLED SDK TO TEST LINK BEHAVIOR
        // const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Wait for DOM to be fully ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true })
          })
        }
        
        // Small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // TEMPORARILY DISABLED SDK READY CALL
        // await sdk.actions.ready()
        console.log('🚫 SDK disabled for link testing')
        
      } catch (error) {
        console.error('❌ Error initializing Farcaster Mini App:', error)
        // Still try to call ready even if there's an error
        // TEMPORARILY DISABLED FALLBACK SDK
        console.log('🚫 Fallback SDK also disabled for testing')
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
