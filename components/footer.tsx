import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer id="footer" className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <img src="/mintedmerch-logo.png" alt="$mintedmerch logo" className="w-48 h-12 object-cover" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              Connecting onchain communities<br />
              with merch that fuels growth.
            </p>
            
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold text-foreground">Community</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                  asChild
                >
                  <a href="https://cura.network/mintedmerch?t=hot" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Join Our Community
                  </a>
                </Button>
                <div className="px-2 py-1 text-xs text-foreground/80">
                  <a 
                    href="#token" 
                    className="hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('token')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Become a Merch Mogul
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Token</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a
                  href="https://app.uniswap.org/swap?outputCurrency=0x774EAeFE73Df7959496Ac92a77279A8D7d690b07&chain=base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/UniswapLogo.png" alt="Uniswap" className="h-3 w-3 mr-1" />
                  Buy $mintedmerch
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a
                  href="https://basescan.org/address/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/BasescanLogoWhiteAndBlue.png" alt="Basescan" className="h-3 w-3 mr-1" />
                  Basescan
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a
                  href="https://www.clanker.world/clanker/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/ClankerLogoBars.png" alt="Clanker" className="h-3 w-3 mr-1" />
                  Clanker
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a
                  href="https://dexscreener.com/base/0x774EAeFE73Df7959496Ac92a77279A8D7d690b07"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/DexscreenerLogo.png" alt="DexScreener" className="h-3 w-3 mr-1" />
                  DexScreener
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a
                  href="https://www.geckoterminal.com/base/pools/0x23d8822b09d7b5194e7bef7acb431afafefa8d8b890a3fb38637d201f8fd3f8d?utm_source=embed"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/GeckoTerminalLogoFullColor.png" alt="GeckoTerminal" className="h-3 w-3 mr-1" />
                  GeckoTerminal
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Shop/Connect</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a href="https://mintedmerch.shop/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Online
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a href="https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Mini App
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a href="https://farcaster.xyz/~/channel/mintedmerch" target="_blank" rel="noopener noreferrer">
                  <img src="/FarcasterLogoWhite.png" alt="Farcaster" className="h-3 w-3 mr-1" />
                  Farcaster
                </a>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="justify-start bg-transparent px-2 py-1 h-8 text-xs hover:text-primary hover:border-primary transition-colors"
                asChild
              >
                <a href="https://x.com/MintedMerchShop" target="_blank" rel="noopener noreferrer">
                  <img src="/Xlogo (1).png" alt="X (Twitter)" className="h-3 w-3 mr-1" />
                  X (Twitter)
                </a>
              </Button>
            </div>
          </div>


        </div>

        <div className="border-t border-border mt-12 pt-8 text-center space-y-4">
          <div className="text-sm text-foreground/60">
            <p className="mb-2">© 2025 Minted Merch. All rights reserved.</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span>Built on</span>
                <svg width="16" height="16" viewBox="0 0 249 249" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 19.671C0 12.9332 0 9.56425 1.26956 6.97276C2.48511 4.49151 4.49151 2.48511 6.97276 1.26956C9.56425 0 12.9332 0 19.671 0H229.329C236.067 0 239.436 0 242.027 1.26956C244.508 2.48511 246.515 4.49151 247.73 6.97276C249 9.56425 249 12.9332 249 19.671V229.329C249 236.067 249 239.436 247.73 242.027C246.515 244.508 244.508 246.515 242.027 247.73C239.436 249 236.067 249 229.329 249H19.671C12.9332 249 9.56425 249 6.97276 247.73C4.49151 246.515 2.48511 244.508 1.26956 242.027C0 239.436 0 236.067 0 229.329V19.671Z" fill="#0003fe"/>
                </svg>
                <span>Base.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Launched on</span>
                <img src="/ClankerLogoBars.png" alt="Clanker" className="h-4 w-4" />
                <span>Clanker.</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-foreground/40 max-w-4xl mx-auto leading-relaxed">
            Note that purchasing cryptocurrency involves inherent risks, as the value of digital assets can be highly volatile and subject to market fluctuations. This token is not a guarantee of financial return or investment success, and you should only invest after conducting your own research and with what you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  )
}
