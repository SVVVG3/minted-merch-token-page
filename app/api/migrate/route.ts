import { NextResponse } from 'next/server'
import { get, set } from '@vercel/edge-config'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    return NextResponse.json({
      success: false,
      message: 'Edge Config migration must be done manually through Vercel dashboard',
      instructions: [
        '1. Go to Vercel Dashboard → Storage → Edge Config',
        '2. Click on your store → Items',
        '3. Add key: "community-posts"',
        '4. Copy the JSON data from /data/community-posts.json as the value',
        '5. Save the item'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Migration endpoint error',
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
