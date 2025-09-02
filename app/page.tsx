'use client'

import { useEffect, useState } from 'react'
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TokenInfo } from "@/components/token-info"
import { MerchShowcase } from "@/components/merch-showcase"
import { CommunityPosts } from "@/components/community-posts"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [isInterfaceReady, setIsInterfaceReady] = useState(false)
  
  // Call ready only when interface is fully loaded and ready
  useEffect(() => {
    const callReady = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready called - interface loaded')
      } catch (error) {
        console.log('ℹ️ Not in Farcaster Mini App context:', error)
      }
    }
    
    if (isInterfaceReady) {
      callReady()
    }
  }, [isInterfaceReady])
  
  // Set interface ready after all content has loaded
  useEffect(() => {
    const handleLoad = () => {
      // Wait a bit more to ensure all content is rendered
      setTimeout(() => {
        setIsInterfaceReady(true)
      }, 500)
    }
    
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
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
