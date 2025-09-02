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
    
    let curatedPosts: CommunityPost[] = []
    let dataSource = 'fallback'
    
    try {
      // Read directly from JSON file
      console.log('📄 Reading from JSON file...')
      const filePath = path.join(process.cwd(), 'data', 'community-posts.json')
      
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const jsonData = JSON.parse(fileContents)
        
        if (jsonData && jsonData.posts && Array.isArray(jsonData.posts)) {
          const allPosts = jsonData.posts
          curatedPosts = allPosts.filter((post: any) => post.featured === true).slice(0, 3)
          dataSource = 'json-file'
          console.log('✅ Loaded from JSON file:', curatedPosts.length, 'featured posts out of', allPosts.length, 'total')
        } else {
          console.log('⚠️ Invalid JSON structure')
        }
      } else {
        console.log('⚠️ JSON file not found')
      }
    } catch (jsonError) {
      console.error('❌ JSON file error:', jsonError)
    }
    
    // If still no posts, use hardcoded fallback
    if (curatedPosts.length === 0) {
      console.log('📦 Using hardcoded fallback posts')
      dataSource = 'hardcoded-fallback'
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