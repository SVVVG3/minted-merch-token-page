'use client'

import { useEffect, useState } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  // Call ready only AFTER interface is fully loaded
  useEffect(() => {
    const callReady = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready called - interface fully loaded')
      } catch (error) {
        console.log('ℹ️ Not in Farcaster Mini App context or SDK not available')
      }
    }
    
    // Wait for window load event to ensure everything is ready
    if (document.readyState === 'complete') {
      // Already loaded
      setTimeout(callReady, 50) // Small delay to ensure React has rendered
    } else {
      // Wait for load
      window.addEventListener('load', () => {
        setTimeout(callReady, 50) // Small delay after load
      })
    }
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
