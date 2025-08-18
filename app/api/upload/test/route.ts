import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Teste da API upload funcionando!')
  return NextResponse.json({ 
    success: true, 
    message: 'API upload funcionando!',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  console.log('🧪 POST da API upload funcionando!')
  return NextResponse.json({ 
    success: true, 
    message: 'POST API upload funcionando!',
    timestamp: new Date().toISOString()
  })
}