'use client'

import { useEffect } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  // Call ready IMMEDIATELY when component loads
  useEffect(() => {
    const callReady = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready called immediately on mount')
      } catch (error) {
        console.log('ℹ️ Not in Farcaster Mini App context or SDK not available')
      }
    }
    
    // Call immediately - no delays
    callReady()
  }, [])
  
  // Also try to call ready synchronously if SDK is already loaded
  if (typeof window !== 'undefined') {
    import('@farcaster/miniapp-sdk').then(({ sdk }) => {
      sdk.actions.ready().then(() => {
        console.log('✅ Farcaster Mini App ready called synchronously')
      }).catch(() => {
        console.log('ℹ️ Sync ready call not needed or failed')
      })
    }).catch(() => {
      // SDK not available, that's fine
    })
  }
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
