"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80 // Approximate header height
      const elementPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setIsMobileMenuOpen(false) // Close mobile menu after navigation
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={() => scrollToSection('footer')} className="cursor-pointer">
              <img src="/mintedmerch-logo.png" alt="$mintedmerch logo" className="w-48 h-30 object-contain" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('token')} className="text-foreground hover:text-primary transition-colors">
              Token
            </button>
            <button onClick={() => scrollToSection('merch')} className="text-foreground hover:text-primary transition-colors">
              Merch
            </button>
            <button onClick={() => scrollToSection('community')} className="text-foreground hover:text-primary transition-colors">
              Community
            </button>
            <a href="https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
              Mini App
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.open('https://mintedmerch.shop/', '_blank', 'noopener,noreferrer')}>
              Shop Now
            </Button>
            <Button size="sm" onClick={() => window.open('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base', '_blank', 'noopener,noreferrer')}>
              Buy $mintedmerch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-background/95 backdrop-blur-sm rounded-b-lg">
            <nav className="flex flex-col space-y-4 mt-4 px-2">
              <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors text-left py-2 px-2 rounded hover:bg-primary/10">
                Home
              </button>
              <button onClick={() => scrollToSection('token')} className="text-foreground hover:text-primary transition-colors text-left py-2 px-2 rounded hover:bg-primary/10">
                Token
              </button>
              <button onClick={() => scrollToSection('merch')} className="text-foreground hover:text-primary transition-colors text-left py-2 px-2 rounded hover:bg-primary/10">
                Merch
              </button>
              <button onClick={() => scrollToSection('community')} className="text-foreground hover:text-primary transition-colors text-left py-2 px-2 rounded hover:bg-primary/10">
                Community
              </button>
              <a href="https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors text-left py-2 px-2 rounded hover:bg-primary/10">
                Mini App
              </a>
              <div className="flex flex-col space-y-2 pt-4 px-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('https://mintedmerch.shop/', '_blank', 'noopener,noreferrer')}>
                  Shop Now
                </Button>
                <Button size="sm" className="w-full" onClick={() => window.open('https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base', '_blank', 'noopener,noreferrer')}>
                  Buy $mintedmerch
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
