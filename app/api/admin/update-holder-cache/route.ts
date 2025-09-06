import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { holderCount } = await request.json()
    
    if (!holderCount || typeof holderCount !== 'number' || holderCount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid holder count provided' 
      }, { status: 400 })
    }
    
    const cacheData = {
      count: holderCount,
      timestamp: new Date().toISOString(),
      source: 'web-scraper'
    }
    
    // Instructions for manual Edge Config update
    const instructions = {
      message: 'To update Edge Config cache manually:',
      steps: [
        '1. Go to Vercel Dashboard → Your Project → Storage → Edge Config',
        '2. Click on your Edge Config store',
        '3. Add/Update key-value pair:',
        `   Key: holder-count-0x774EAeFE73Df7959496Ac92a77279A8D7d690b07`,
        `   Value: ${JSON.stringify(cacheData)}`,
        '4. Save changes'
      ],
      cacheKey: 'holder-count-0x774EAeFE73Df7959496Ac92a77279A8D7d690b07',
      cacheValue: cacheData
    }
    
    console.log(`📝 Admin request to cache holder count: ${holderCount}`)
    console.log('📋 Edge Config update instructions:', instructions)
    
    return NextResponse.json({
      success: true,
      holderCount,
      instructions
    })
    
  } catch (error) {
    console.error('❌ Error in admin cache update:', error)
    return NextResponse.json({ 
      error: 'Failed to process cache update request' 
    }, { status: 500 })
  }
}
