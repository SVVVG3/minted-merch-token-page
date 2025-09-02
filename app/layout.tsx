import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MintedMerch - Where Tokens Meet Merch',
  description: 'Minted Merch is an ecosystem where tokens unlock exclusive collaborations, token-gated discounts, and a growing community. Our mission is to connect onchain communities with merch that fuels growth.',
  keywords: ['crypto', 'merch', 'tokens', 'blockchain', 'base', 'mintedmerch', 'defi', 'nft'],
  authors: [{ name: 'MintedMerch' }],
  creator: 'MintedMerch',
  publisher: 'MintedMerch',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'MintedMerch - Where Tokens Meet Merch',
    description: 'Minted Merch is an ecosystem where tokens unlock exclusive collaborations, token-gated discounts, and a growing community.',
    url: 'https://coin.mintedmerch.shop',
    siteName: 'MintedMerch',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MintedMerch - Where Tokens Meet Merch',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MintedMerch - Where Tokens Meet Merch',
    description: 'Minted Merch is an ecosystem where tokens unlock exclusive collaborations, token-gated discounts, and a growing community.',
    images: ['/og-image.png'],
  },
  other: {
    // Farcaster Mini App embed support
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://coin.mintedmerch.shop/embed-image.png",
      button: {
        title: "Where Tokens Meet Merch",
        action: {
          type: "launch_miniapp",
          url: "https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch",
          name: "MintedMerch",
          splashImageUrl: "https://coin.mintedmerch.shop/splash-logo.png",
          splashBackgroundColor: "#000000"
        }
      }
    }),
    // For backward compatibility
    'fc:frame': JSON.stringify({
      version: "1",
      imageUrl: "https://coin.mintedmerch.shop/embed-image.png",
      button: {
        title: "Where Tokens Meet Merch",
        action: {
          type: "launch_frame",
          url: "https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch",
          name: "MintedMerch",
          splashImageUrl: "https://coin.mintedmerch.shop/splash-logo.png",
          splashBackgroundColor: "#000000"
        }
      }
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/.well-known/farcaster.json" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
