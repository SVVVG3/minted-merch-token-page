import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface CommunityPost {
  id: string
  username: string
  platform: 'farcaster' | 'x'
  content: string
  image?: string
  likes: number
  comments: number
  reposts: number
  timestamp: string
  url: string
  featured?: boolean
}

export async function GET() {
  try {
    console.log('🚀 Community Posts API called')
    
    // Your real posts data (embedded directly)
    const allPosts: CommunityPost[] = [
      {
        id: "post-1756792938657",
        username: "@metamu",
        platform: "farcaster",
        content: "Good Morning /farcaster 🤘🏿🌹\n\nMad love to @svvvg3.eth x @katkartel.eth for their fun\nmerch based app /mintedmerch 🎒\n\nI already won this $Bankr just for shopping & I won $10 gift card from the homie @suffuze.eth!\n\nIf you feel like winning... 👀🏆\n/mintedmerch 💳",
        likes: 12,
        comments: 4,
        reposts: 4,
        timestamp: "2025-09-02T06:02:18.657Z",
        url: "https://farcaster.xyz/metamu/0x44a92888651fe46c555734e5d2958210644a2ef4",
        featured: false
      },
      {
        id: "featured-1",
        username: "@tracyit",
        platform: "farcaster",
        content: "MFW I'm on my way out and my fits are fire!! \n\nStyle and quality all mixed in one!",
        image: "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/120c85a6-9f49-4018-7faf-ab4a4e97ed00/original",
        likes: 20,
        comments: 7,
        reposts: 7,
        timestamp: "2025-08-27T10:30:00Z",
        url: "https://farcaster.xyz/tracyit/0xedcc7679",
        featured: true
      },
      {
        id: "featured-2",
        username: "@startupoppa",
        platform: "x",
        content: "solana does have such dominance in speculation (which is a very big market), \n\nbut i personally prefer \n@base\n because their eyes are on the mainstream consumers who buy everyday products and services. \n\ni just bought a \n@DickbuttCTO\n hat from \n@farcaster_xyz\n mini app by \n@_SVVVG3\n - works smooth like \n@Shopify\n \n\ni can't see my girl aping $1K on a meme coin, but i could see her buying a cute hat onchain. \n\nmy honest view is that they can coexist. solana specializing into big volume based speculation space, base sipping in to mass consumer market. \n\nmore bullish than ever about the inevitable end game.",
        image: "https://pbs.twimg.com/media/GvmH3QHXwAA_ISD?format=jpg&name=large",
        likes: 56,
        comments: 17,
        reposts: 8,
        timestamp: "2025-07-11T11:11:00Z",
        url: "https://x.com/startupoppa/status/1943734862655127846",
        featured: true
      },
      {
        id: "featured-3",
        username: "@beatsbyoptic",
        platform: "x",
        content: "It's a vibe\n!ribbutt\n\nJust got my new \n@CryptoaDickButt\n OG tee from \n@MintedMerchShop\n \n\nGoes great with my \n@bankr\n hat I ordered too.\n\nGo order yours today!",
        image: "https://pbs.twimg.com/media/Gwaajn_WwAEHOf3?format=jpg&name=large",
        likes: 7,
        comments: 3,
        reposts: 2,
        timestamp: "2025-07-21T14:50:00Z",
        url: "https://x.com/beatsbyoptic/status/1947413831095132624",
        featured: true
      }
    ]
    
    // Filter to only featured posts
    const curatedPosts = allPosts.filter(post => post.featured === true).slice(0, 3)
    const dataSource = 'embedded-data'
    
    console.log('✅ Loaded embedded posts:', curatedPosts.length, 'featured posts out of', allPosts.length, 'total')

    
    console.log(`📊 Returning ${curatedPosts.length} posts from ${dataSource}`)
    
    return NextResponse.json({
      success: true,
      posts: curatedPosts,
      count: curatedPosts.length,
      source: dataSource
    })

  } catch (error) {
    console.error('❌ Error in community posts API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load community posts',
      posts: [],
      count: 0,
      source: 'error'
    }, { status: 500 })
  }
}