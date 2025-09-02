"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Star, StarOff, Plus, Save, ExternalLink, Eye, EyeOff, Edit, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function CommunityPostsAdmin() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [newPost, setNewPost] = useState({
    url: '',
    username: '',
    platform: 'farcaster' as 'farcaster' | 'x',
    content: '',
    image: '',
    likes: 0,
    comments: 0,
    reposts: 0
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/community-posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setMessage({ type: 'error', text: 'Failed to load posts' })
    } finally {
      setLoading(false)
    }
  }

  const savePosts = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/community-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Posts saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Failed to save posts')
      }
    } catch (error) {
      console.error('Error saving posts:', error)
      setMessage({ type: 'error', text: 'Failed to save posts' })
    } finally {
      setSaving(false)
    }
  }

  const toggleFeatured = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, featured: !post.featured }
      }
      return post
    }))
  }

  const deletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  const startEditing = (postId: string) => {
    setEditingPost(postId)
  }

  const cancelEditing = () => {
    setEditingPost(null)
  }

  const saveEdit = (postId: string, updatedPost: Partial<CommunityPost>) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, ...updatedPost }
        : post
    ))
    setEditingPost(null)
    setMessage({ type: 'success', text: 'Post updated! Remember to save changes.' })
  }

  const addPost = () => {
    if (!newPost.url || !newPost.username || !newPost.content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      username: newPost.username.startsWith('@') ? newPost.username : `@${newPost.username}`,
      platform: newPost.platform,
      content: newPost.content,
      image: newPost.image || undefined,
      likes: newPost.likes,
      comments: newPost.comments,
      reposts: newPost.reposts,
      timestamp: new Date().toISOString(),
      url: newPost.url,
      featured: false
    }

    setPosts([post, ...posts])
    setNewPost({
      url: '',
      username: '',
      platform: 'farcaster',
      content: '',
      image: '',
      likes: 0,
      comments: 0,
      reposts: 0
    })
    setShowAddForm(false)
    setMessage({ type: 'success', text: 'Post added! Remember to save changes.' })
  }

  const featuredPosts = posts.filter(post => post.featured)
  const nonFeaturedPosts = posts.filter(post => !post.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Community Posts Dashboard</h1>
            <p className="text-muted-foreground">Manage featured posts for your community spotlight</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
            >
              {showAddForm ? <EyeOff className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddForm ? 'Hide Form' : 'Add Post'}
            </Button>
            <Button onClick={savePosts} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Post URL *</label>
                  <Input
                    placeholder="https://warpcast.com/user/0x123... or https://x.com/user/status/123..."
                    value={newPost.url}
                    onChange={(e) => setNewPost({...newPost, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Username *</label>
                  <Input
                    placeholder="@username"
                    value={newPost.username}
                    onChange={(e) => setNewPost({...newPost, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newPost.platform}
                    onChange={(e) => setNewPost({...newPost, platform: e.target.value as 'farcaster' | 'x'})}
                  >
                    <option value="farcaster">Farcaster</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL (optional)</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newPost.image}
                    onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  placeholder="Post content..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Likes</label>
                  <Input
                    type="number"
                    value={newPost.likes}
                    onChange={(e) => setNewPost({...newPost, likes: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Comments</label>
                  <Input
                    type="number"
                    value={newPost.comments}
                    onChange={(e) => setNewPost({...newPost, comments: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reposts</label>
                  <Input
                    type="number"
                    value={newPost.reposts}
                    onChange={(e) => setNewPost({...newPost, reposts: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <Button onClick={addPost} className="w-full">
                Add Post
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Featured Posts ({featuredPosts.length}/3)
            </h2>
            <div className="space-y-4">
              {featuredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onToggleFeatured={toggleFeatured}
                  onDelete={deletePost}
                  onEdit={startEditing}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEditing}
                  isEditing={editingPost === post.id}
                />
              ))}
              {featuredPosts.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No featured posts yet. Click the star icon on posts to feature them.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">All Posts ({posts.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {nonFeaturedPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onToggleFeatured={toggleFeatured}
                  onDelete={deletePost}
                  onEdit={startEditing}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEditing}
                  isEditing={editingPost === post.id}
                />
              ))}
              {nonFeaturedPosts.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No additional posts. Add some posts to get started!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ 
  post, 
  onToggleFeatured, 
  onDelete,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  isEditing
}: { 
  post: CommunityPost
  onToggleFeatured: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onSaveEdit: (id: string, updatedPost: Partial<CommunityPost>) => void
  onCancelEdit: () => void
  isEditing: boolean
}) {
  const [editForm, setEditForm] = useState({
    username: post.username,
    content: post.content,
    image: post.image || '',
    likes: post.likes,
    comments: post.comments,
    reposts: post.reposts,
    url: post.url || ''
  })

  const handleSave = () => {
    onSaveEdit(post.id, editForm)
  }

  const handleCancel = () => {
    setEditForm({
      username: post.username,
      content: post.content,
      image: post.image || '',
      likes: post.likes,
      comments: post.comments,
      reposts: post.reposts,
      url: post.url || ''
    })
    onCancelEdit()
  }

  return (
    <Card className={post.featured ? 'border-yellow-500 bg-yellow-50/50' : ''}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={post.platform === 'farcaster' ? 'default' : 'secondary'}>
                {post.platform === 'farcaster' ? 'FC' : 'X'}
              </Badge>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleSave} className="text-green-600">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="text-gray-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                placeholder="Username"
                className="text-sm"
              />
              <Input
                value={editForm.url}
                onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                placeholder="Post URL"
                className="text-sm"
              />
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                placeholder="Content"
                className="text-sm"
                rows={3}
              />
              <Input
                value={editForm.image}
                onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                placeholder="Image URL (optional)"
                className="text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={editForm.likes}
                  onChange={(e) => setEditForm({...editForm, likes: parseInt(e.target.value) || 0})}
                  placeholder="Likes"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={editForm.comments}
                  onChange={(e) => setEditForm({...editForm, comments: parseInt(e.target.value) || 0})}
                  placeholder="Comments"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={editForm.reposts}
                  onChange={(e) => setEditForm({...editForm, reposts: parseInt(e.target.value) || 0})}
                  placeholder="Reposts"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={post.platform === 'farcaster' ? 'default' : 'secondary'}>
                  {post.platform === 'farcaster' ? 'FC' : 'X'}
                </Badge>
                <span className="font-medium">{post.username}</span>
                {post.url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleFeatured(post.id)}
                  className={post.featured ? 'text-yellow-500' : 'text-muted-foreground'}
                >
                  {post.featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(post.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(post.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm mb-2">{post.content}</p>
            {post.image && (
              <div className="mb-2">
                <img src={post.image} alt="Post" className="w-full h-32 object-cover rounded" />
              </div>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>🔄 {post.reposts}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
