'use client'

import { useEffect } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  useEffect(() => {
    // Call ready to dismiss Farcaster Mini App splash screen
    const callReady = async () => {
      try {
        // Check if we're in a Farcaster Mini App context
        if (typeof window !== 'undefined' && (window as any).farcaster) {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          await sdk.actions.ready()
          console.log('✅ Farcaster Mini App ready called')
        }
      } catch (error) {
        // Silently fail if not in Mini App context or SDK not available
        console.log('ℹ️ Not in Farcaster Mini App context or SDK not available')
      }
    }
    
    callReady()
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
