import { NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

interface CommunityPost {
  id: string
  username: string
  platform: 'farcaster' | 'x'
  content: string
  image?: string
  likes: number
  comments: number
  reposts: number
  timestamp?: string
  url?: string
}

export async function GET() {
  try {
    console.log('🚀 Community Posts API called')
    
    // Read curated posts from Vercel KV
    let curatedPosts: CommunityPost[] = []
    
    try {
      const data = await get('community-posts') as any
      
      if (data && data.posts) {
        const allPosts = data.posts || []
        // Only show featured posts on the frontend (max 3)
        curatedPosts = allPosts.filter((post: any) => post.featured).slice(0, 3)
        console.log('✅ Loaded featured posts from Edge Config:', curatedPosts.length, 'of', allPosts.length, 'total')
      } else {
        console.log('⚠️ No data in Edge Config, using fallback posts')
        // Fallback posts if no data exists
        curatedPosts = [
        {
          id: "fallback-1",
          username: "@cryptofashion",
          platform: "farcaster",
          content: "Just copped the new $MINTED hoodie! The quality is insane 🔥",
          image: "/person-wearing-black-crypto-hoodie-taking-mirror-s.png",
          likes: 42,
          comments: 8,
          reposts: 12,
          timestamp: new Date().toISOString(),
          url: "https://warpcast.com/cryptofashion/0x12345"
        },
        {
          id: "fallback-2",
          username: "@defi_drip",
          platform: "x",
          content: "Wearing my @mintedmerch tee to the Base meetup tonight! 💙",
          image: "/person-wearing-white-base-blockchain-t-shirt-at-cr.png",
          likes: 89,
          comments: 15,
          reposts: 23,
          timestamp: new Date().toISOString(),
          url: "https://x.com/defi_drip/status/123456789"
        },
        {
          id: "fallback-3",
          username: "@nft_collector",
          platform: "farcaster",
          content: "The $MINTED community is something special. Great merch, great vibes! 🚀",
          image: "/group-of-friends-wearing-various-crypto-streetwear.png",
          likes: 156,
          comments: 31,
          reposts: 45,
          timestamp: new Date().toISOString(),
          url: "https://warpcast.com/nft_collector/0x67890"
        }
      ]
    }
    } catch (edgeConfigError) {
      console.error('Error accessing Edge Config:', edgeConfigError)
      // Use fallback posts if Edge Config fails
      curatedPosts = [
        {
          id: "fallback-1",
          username: "@cryptofashion",
          platform: "farcaster",
          content: "Just copped the new $MINTED hoodie! The quality is insane 🔥",
          image: "/person-wearing-black-crypto-hoodie-taking-mirror-s.png",
          likes: 42,
          comments: 8,
          reposts: 12,
          timestamp: new Date().toISOString(),
          url: "https://warpcast.com/cryptofashion/0x12345"
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      posts: curatedPosts,
      count: curatedPosts.length,
      source: curatedPosts.length > 0 ? 'edge-config' : 'fallback'
    })

  } catch (error) {
    console.error('❌ Error in community posts API:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch community posts',
        posts: [] 
      },
      { status: 500 }
    )
  }
}

// Future implementation for real Farcaster API integration
async function fetchFarcasterPosts(query: string = 'mintedmerch'): Promise<CommunityPost[]> {
  try {
    // Example using Neynar API (you'd need to sign up and get an API key)
    // const response = await fetch(`https://api.neynar.com/v2/farcaster/cast/search?q=${query}`, {
    //   headers: {
    //     'api_key': process.env.NEYNAR_API_KEY || '',
    //   }
    // })
    
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Error fetching Farcaster posts:', error)
    return []
  }
}

// Future implementation for X API integration
async function fetchXPosts(query: string = '@mintedmerch'): Promise<CommunityPost[]> {
  try {
    // Example using X API v2 (you'd need to set up X API credentials)
    // const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${query}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
    //   }
    // })
    
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Error fetching X posts:', error)
    return []
  }
}
