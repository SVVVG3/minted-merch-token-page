"use client"

import { Button } from "@/components/ui/button"
import { openExternalUrl, openShopUrl } from "@/lib/farcaster-utils"
import { useState, useEffect } from "react"

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const carouselImages = [
    {
      src: "/IMG_3841.jpg",
      alt: "Mintedmerch streetwear collection"
    },
    {
      src: "/AFPocketTee.jpg",
      alt: "AF Pocket Tee"
    },
    {
      src: "/BankrHatMiami.jpg",
      alt: "Bankr Hat Miami"
    },
    {
      src: "/CatBankrBag.jpg",
      alt: "Cat Bankr Bag"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [carouselImages.length])

  return (
    <section id="home" className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-7xl font-bold text-balance leading-tight">
                Where Tokens
                <span className="text-primary block">Meet Merch</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-lg">
                Unlock exclusive collaborations, token-gated discounts, and a growing community. Our mission is to connect onchain communities with merch that fuels growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" onClick={() => openShopUrl()}>
                Shop Merch
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent flex items-center gap-2" onClick={() => openExternalUrl('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base')}>
                <img src="/UniswapLogo.png" alt="Uniswap" className="h-5 w-5" /> Buy $mintedmerch
              </Button>
              <Button variant="secondary" size="lg" className="text-lg px-8" onClick={() => openExternalUrl('https://cura.network/mintedmerch?t=hot')}>
                Join Our Community
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1K+</div>
                <div className="text-sm text-muted-foreground">Token Holders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3+ <span className="text-primary">Years</span></div>
                <div className="text-sm text-muted-foreground">Onchain Merch Experience</div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="w-80 max-w-full lg:w-[59%] aspect-square bg-card rounded-2xl p-8 border border-border relative overflow-hidden">
              <img
                src={carouselImages[currentImageIndex].src}
                alt={carouselImages[currentImageIndex].alt}
                className="w-full h-full object-cover rounded-xl transition-opacity duration-500"
              />
              
              {/* Carousel indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
