import { NextResponse } from 'next/server'
import { get, set } from '@vercel/edge-config'

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
  featured?: boolean
}

export async function POST(request: Request) {
  try {
    const { posts } = await request.json()
    
    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { success: false, error: 'Posts must be an array' },
        { status: 400 }
      )
    }

    // Ensure only 3 posts are featured
    const featuredPosts = posts.filter((post: CommunityPost) => post.featured)
    if (featuredPosts.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum 3 posts can be featured' },
        { status: 400 }
      )
    }

    // Prepare the data structure
    const data = {
      posts: posts,
      lastUpdated: new Date().toISOString(),
      featuredCount: featuredPosts.length,
      totalCount: posts.length
    }

    // Save to Edge Config
    await set('community-posts', data)

    console.log('✅ Community posts saved:', {
      total: posts.length,
      featured: featuredPosts.length,
      timestamp: data.lastUpdated
    })

    return NextResponse.json({
      success: true,
      message: 'Posts saved successfully',
      stats: {
        total: posts.length,
        featured: featuredPosts.length,
        lastUpdated: data.lastUpdated
      }
    })

  } catch (error) {
    console.error('❌ Error saving community posts:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET method to fetch posts for admin (same as public API but with admin metadata)
export async function GET() {
  try {
    // Get data from Edge Config
    const data = await get('community-posts') as any
    
    if (data && data.posts) {
      return NextResponse.json({
        success: true,
        posts: data.posts || [],
        metadata: {
          lastUpdated: data.lastUpdated,
          featuredCount: data.featuredCount || 0,
          totalCount: data.totalCount || 0
        }
      })
    } else {
      // Return empty state for new installations
      return NextResponse.json({
        success: true,
        posts: [],
        metadata: {
          lastUpdated: null,
          featuredCount: 0,
          totalCount: 0
        }
      })
    }

  } catch (error) {
    console.error('❌ Error fetching admin community posts:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        posts: []
      },
      { status: 500 }
    )
  }
}
