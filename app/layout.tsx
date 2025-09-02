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
    // Farcaster Frame/Mini App support
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://coin.mintedmerch.shop/og-image.png',
    'fc:frame:button:1': 'Open Mini App',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://farcaster.xyz/miniapps/1rQnrU1XOZie/minted-merch',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
