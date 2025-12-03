import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try a simple query that doesn't require auth
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection works!',
      data,
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    })
  }
}