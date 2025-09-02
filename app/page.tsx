'use client'

import { useEffect } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  // Call ready exactly as documented
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Import the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Call ready after app is fully loaded
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready() called successfully')
      } catch (error) {
        console.error('❌ Error calling ready():', error)
      }
    }
    
    // Call ready immediately when component mounts
    initializeApp()
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
