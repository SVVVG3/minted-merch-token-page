"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat2, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

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

interface FarcasterCast {
  hash: string
  author: {
    username: string
    display_name: string
    pfp_url: string
  }
  text: string
  timestamp: string
  reactions: {
    likes_count: number
    recasts_count: number
    replies_count: number
  }
  embeds?: Array<{
    url?: string
    metadata?: {
      image?: {
        url_original: string
      }
    }
  }>
}

export function CommunityPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)

  // Fallback posts in case API fails
  const fallbackPosts: CommunityPost[] = [
    {
      id: "1",
      username: "@cryptofashion",
      platform: "farcaster",
      content: "Just copped the new $MINTED hoodie! The quality is insane 🔥",
      image: "/person-wearing-black-crypto-hoodie-taking-mirror-s.png",
      likes: 42,
      comments: 8,
      reposts: 12,
    },
    {
      id: "2",
      username: "@defi_drip",
      platform: "x",
      content: "Wearing my @mintedmerch tee to the Base meetup tonight! 💙",
      image: "/person-wearing-white-base-blockchain-t-shirt-at-cr.png",
      likes: 89,
      comments: 15,
      reposts: 23,
    },
    {
      id: "3",
      username: "@nft_collector",
      platform: "farcaster",
      content: "The $MINTED community is something special. Great merch, great vibes! 🚀",
      image: "/group-of-friends-wearing-various-crypto-streetwear.png",
      likes: 156,
      comments: 31,
      reposts: 45,
    },
  ]

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        console.log('🚀 Fetching community posts...')
        
        // Try to fetch from Farcaster API
        // Note: This is a simplified example - you might need to use a service like Neynar or Pinata
        const response = await fetch('/api/community-posts')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Fetched community posts:', data)
          setPosts(data.posts || fallbackPosts)
        } else {
          console.log('⚠️ API failed, using fallback posts')
          setPosts(fallbackPosts)
        }
      } catch (error) {
        console.error('❌ Error fetching community posts:', error)
        console.log('Using fallback posts')
        setPosts(fallbackPosts)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityPosts()
  }, [])

  return (
    <section id="community" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Community <span className="text-primary">Spotlight</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            See how our community rocks their Minted Merch across Farcaster and X. Tag us to get featured - and earn some $mintedmerch!
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-muted rounded w-12"></div>
                    <div className="h-4 bg-muted rounded w-12"></div>
                    <div className="h-4 bg-muted rounded w-12"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open(post.url, '_blank', 'noopener,noreferrer')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {post.platform === "farcaster" ? "FC" : "X"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{post.username}</div>
                    <div className="text-xs text-muted-foreground capitalize">{post.platform}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="text-sm mb-4 text-pretty">{post.content}</p>

                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Community member wearing mintedmerch"
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat2 className="h-4 w-4" />
                      <span>{post.reposts}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <a href="https://cura.network/mintedmerch?t=hot" target="_blank" rel="noopener noreferrer">
              View More Posts
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
