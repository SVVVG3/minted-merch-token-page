import { NextResponse } from 'next/server'
import { get, set } from '@vercel/edge-config'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🚀 Starting migration from JSON to Edge Config...')
    
    // Read existing JSON file
    const filePath = path.join(process.cwd(), 'data', 'community-posts.json')
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(fileContents)
      
      console.log('📄 Found JSON data:', {
        posts: data.posts?.length || 0,
        lastUpdated: data.lastUpdated
      })
      
      // Migrate to Edge Config
      await set('community-posts', data)
      
      console.log('✅ Migration completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Data migrated successfully from JSON to Edge Config',
        migrated: {
          posts: data.posts?.length || 0,
          featuredCount: data.featuredCount || 0,
          totalCount: data.totalCount || 0,
          lastUpdated: data.lastUpdated
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No JSON file found to migrate'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check current Edge Config data
    const edgeConfigData = await get('community-posts') as any
    
    // Check if JSON file exists
    const filePath = path.join(process.cwd(), 'data', 'community-posts.json')
    const jsonExists = fs.existsSync(filePath)
    
    let jsonData = null
    if (jsonExists) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      jsonData = JSON.parse(fileContents)
    }
    
    return NextResponse.json({
      edgeConfig: {
        exists: !!edgeConfigData,
        posts: edgeConfigData?.posts?.length || 0,
        lastUpdated: edgeConfigData?.lastUpdated
      },
      json: {
        exists: jsonExists,
        posts: jsonData?.posts?.length || 0,
        lastUpdated: jsonData?.lastUpdated
      },
      needsMigration: jsonExists && !edgeConfigData
    })

  } catch (error) {
    console.error('❌ Error checking migration status:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
